'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import TrainCard from '@/components/TrainCard';
import TrainModal from '@/components/TrainModal';
import { useAuth } from '@/context/AuthContext';
import { useTrains } from '@/hooks/useTrains';
import type { Train } from '@/types';

type Filter = 'all' | 'morning' | 'afternoon' | 'evening';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',       label: 'Всі маршрути' },
  { key: 'morning',   label: 'Ранок'         },
  { key: 'afternoon', label: 'День'           },
  { key: 'evening',   label: 'Вечір'          },
];

function applyFilter(trains: Train[], filter: Filter): Train[] {
  if (filter === 'all') return trains;
  return trains.filter(t => {
    const h = new Date(t.departureTime).getHours();
    if (filter === 'morning')   return h >= 5  && h < 12;
    if (filter === 'afternoon') return h >= 12 && h < 18;
    if (filter === 'evening')   return h >= 18 || h < 5;
    return true;
  });
}

interface ToastState { msg: string; type: 'success' | 'error' }

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const { trains, loading, error, create, update, remove } = useTrains();

  const [filter,  setFilter]  = useState<Filter>('all');
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState<Train | null>(null);
  const [toast,   setToast]   = useState<ToastState | null>(null);

  const showToast = (msg: string, type: ToastState['type'] = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const openAdd    = () => { setEditing(null); setModal(true); };
  const openEdit   = (t: Train) => { setEditing(t); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleSave = async (data: Omit<Train, 'id' | 'createdAt'>) => {
    try {
      if (editing) {
        await update(editing.id, data);
        showToast('Маршрут оновлено');
      } else {
        await create(data);
        showToast('Маршрут додано');
      }
      closeModal();
    } catch {
      showToast('Помилка збереження', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Видалити цей маршрут?')) return;
    try {
      await remove(id);
      showToast('Маршрут видалено');
    } catch {
      showToast('Помилка видалення', 'error');
    }
  };

  const visible = applyFilter(trains, filter);

  return (
    <>
      <Navbar />

      <main style={{ paddingBottom: 140 }}>

        {/* Hero */}
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 24px 48px' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--rose)', letterSpacing: '0.16em', textTransform: 'uppercase', margin: '0 0 18px', fontFamily: 'var(--font-sans)' }}>
            Розклад потягів України
          </p>
          <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 'clamp(52px, 9vw, 92px)', lineHeight: 0.93, color: 'var(--cream)', margin: '0 0 48px', letterSpacing: '-0.02em' }}>
            Знайди<br />свій поїзд
          </h1>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {FILTERS.map(f => (
              <button
                key={f.key}
                className={`filter-tab ${filter === f.key ? 'filter-tab-active' : 'filter-tab-inactive'}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </section>

        <div className="section-divider" />

        {/* Count row */}
        {!loading && (
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted-l)', margin: 0, fontFamily: 'var(--font-sans)' }}>
              {visible.length > 0
                ? `${visible.length} маршрут${visible.length === 1 ? '' : visible.length < 5 ? 'и' : 'ів'}`
                : 'Нічого не знайдено'}
            </p>
            {isAuthenticated && (
              <button
                onClick={openAdd}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', background: 'var(--cream)', color: 'var(--text-d)', border: 'none', borderRadius: 100, fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
              >
                <span style={{ fontSize: '1rem', lineHeight: 1 }}>+</span>
                Додати маршрут
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 20 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ borderRadius: 20, overflow: 'hidden', background: '#1F1613' }}>
                  <div className="skeleton" style={{ height: 188 }} />
                  <div style={{ padding: 18 }}>
                    <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 12 }} />
                    <div className="skeleton" style={{ height: 22, width: '80%', marginBottom: 16 }} />
                    <div className="skeleton" style={{ height: 12, width: '100%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <p style={{ color: 'var(--rose)', fontSize: '0.95rem', fontFamily: 'var(--font-sans)' }}>{error}</p>
            </div>
          ) : visible.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <p style={{ fontSize: '3rem', marginBottom: 12 }}>🚂</p>
              <p style={{ color: 'var(--muted-l)', fontSize: '0.95rem', margin: '0 0 24px', fontFamily: 'var(--font-sans)' }}>
                {filter === 'all' ? 'Маршрутів поки немає' : `Немає маршрутів для «${FILTERS.find(f => f.key === filter)?.label}»`}
              </p>
              {isAuthenticated && filter === 'all' && (
                <button onClick={openAdd} style={{ padding: '13px 28px', background: 'var(--cream)', color: 'var(--text-d)', border: 'none', borderRadius: 100, fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'var(--font-sans)' }}>
                  Додати перший маршрут
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 20 }}>
              {visible.map(t => (
                <TrainCard
                  key={t.id}
                  train={t}
                  canEdit={isAuthenticated}
                  onEdit={() => openEdit(t)}
                  onDelete={() => handleDelete(t.id)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {isAuthenticated && (
        <button className="fab" onClick={openAdd} aria-label="Додати маршрут" style={{ display: 'flex' }}>
          +
        </button>
      )}

      {modal && <TrainModal train={editing} onClose={closeModal} onSave={handleSave} />}

      {toast && (
        <div className={`toast toast-${toast.type}`} role="status">
          {toast.msg}
        </div>
      )}
    </>
  );
}
