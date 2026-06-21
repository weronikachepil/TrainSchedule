'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import TrainModal from '@/components/TrainModal';
import ConfirmModal from '@/components/ConfirmModal';
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

const fmtTime = (d: string) =>
  new Date(d).toLocaleString('uk-UA', { hour: '2-digit', minute: '2-digit' });

const fmtDate = (d: string) =>
  new Date(d).toLocaleString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' });

interface ToastState { msg: string; type: 'success' | 'error' }

export default function HomePage() {
  const [filter,          setFilter]          = useState<Filter>('all');
  const [search,          setSearch]          = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [modal,           setModal]           = useState(false);
  const [editing,         setEditing]         = useState<Train | null>(null);
  const [toast,           setToast]           = useState<ToastState | null>(null);
  const [confirmId,       setConfirmId]       = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const { isAuthenticated, role, userId } = useAuth();
  const isAdmin = role === 'admin';
  const canManage = (createdById: number | null) =>
    isAdmin || (isAuthenticated && createdById === userId);

  const { trains, loading, error, create, update, remove } = useTrains(debouncedSearch);

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

  const handleDelete = (id: number) => setConfirmId(id);

  const handleConfirmDelete = async () => {
    if (confirmId === null) return;
    const id = confirmId;
    setConfirmId(null);
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

      <main style={{ paddingBottom: 120 }}>

        {/* Hero */}
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 24px 48px' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--rose)', letterSpacing: '0.16em', textTransform: 'uppercase', margin: '0 0 18px', fontFamily: 'var(--font-sans)' }}>
            Розклад потягів України
          </p>
          <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 'clamp(48px, 8vw, 88px)', lineHeight: 0.93, color: 'var(--cream)', margin: '0 0 48px', letterSpacing: '-0.02em' }}>
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

        {/* Toolbar */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 0 }}>
            <span style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              fontSize: '0.85rem', pointerEvents: 'none', opacity: 0.4,
            }}>🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Пошук за номером, напрямком або станцією..."
              style={{
                width: '100%',
                padding: '9px 14px 9px 36px',
                background: 'rgba(236,232,223,0.08)',
                border: '1.5px solid rgba(236,232,223,0.12)',
                borderRadius: 100,
                color: 'var(--cream)',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-sans)',
                outline: 'none',
                transition: 'border-color 0.18s, background 0.18s',
              }}
              onFocus={e => {
                e.target.style.borderColor = 'rgba(196,145,138,0.5)';
                e.target.style.background = 'rgba(236,232,223,0.12)';
              }}
              onBlur={e => {
                e.target.style.borderColor = 'rgba(236,232,223,0.12)';
                e.target.style.background = 'rgba(236,232,223,0.08)';
              }}
            />
          </div>

          {/* Count */}
          {!loading && (
            <p style={{ fontSize: '0.8rem', color: 'var(--muted-l)', margin: 0, fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}>
              {visible.length > 0
                ? `${visible.length} маршрут${visible.length === 1 ? '' : visible.length < 5 ? 'и' : 'ів'}`
                : 'Нічого не знайдено'}
            </p>
          )}

          {/* Add button */}
          {isAuthenticated && (
            <button
              onClick={openAdd}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'var(--cream)', color: 'var(--text-d)', border: 'none', borderRadius: 100, fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}
            >
              <span style={{ fontSize: '1rem', lineHeight: 1 }}>+</span>
              Додати маршрут
            </button>
          )}
        </div>

        {/* Table */}
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{
                  background: '#1F1613',
                  borderRadius: 14,
                  padding: '18px 24px',
                  display: 'flex',
                  gap: 32,
                  alignItems: 'center',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.14)',
                  opacity: 1 - i * 0.12,
                }}>
                  <div className="skeleton" style={{ height: 28, width: 72, borderRadius: 100 }} />
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: '0 0 200px' }}>
                    <div className="skeleton" style={{ height: 14, width: 70, borderRadius: 4 }} />
                    <div className="skeleton" style={{ height: 10, width: 16, borderRadius: 4 }} />
                    <div className="skeleton" style={{ height: 14, width: 70, borderRadius: 4 }} />
                  </div>
                  <div className="skeleton" style={{ height: 14, width: 140, borderRadius: 4 }} />
                  <div className="skeleton" style={{ height: 18, width: 55, borderRadius: 4 }} />
                  <div className="skeleton" style={{ height: 18, width: 55, borderRadius: 4 }} />
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
                {filter === 'all'
                  ? 'Маршрутів поки немає'
                  : `Немає маршрутів для «${FILTERS.find(f => f.key === filter)?.label}»`}
              </p>
              {isAuthenticated && filter === 'all' && (
                <button onClick={openAdd} style={{ padding: '13px 28px', background: 'var(--cream)', color: 'var(--text-d)', border: 'none', borderRadius: 100, fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'var(--font-sans)' }}>
                  Додати перший маршрут
                </button>
              )}
            </div>
          ) : (
            <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
              <table className="schedule-table" style={{ minWidth: 680 }}>
                <thead>
                  <tr>
                    <th>Номер</th>
                    <th>Напрямок</th>
                    <th>Станція</th>
                    <th>Відправлення</th>
                    <th>Прибуття</th>
                    {isAuthenticated && <th />}
                  </tr>
                </thead>
                <tbody>
                  {visible.map(t => {
                    const [from, to] = t.direction.split(' → ');
                    const rowCanManage = canManage(t.createdById);
                    return (
                      <tr key={t.id}>

                        {/* Train number */}
                        <td>
                          <span style={{
                            display: 'inline-block',
                            padding: '5px 12px',
                            borderRadius: 100,
                            border: '1.5px solid var(--rose)',
                            color: 'var(--rose)',
                            fontFamily: 'var(--font-syne)',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            letterSpacing: '0.06em',
                            whiteSpace: 'nowrap',
                          }}>
                            {t.trainNumber}
                          </span>
                        </td>

                        {/* Direction */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, whiteSpace: 'nowrap' }}>
                            <div>
                              <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-d)', lineHeight: 1.2 }}>
                                {from}
                              </div>
                              <div style={{ fontSize: '0.68rem', color: 'var(--muted-d)', marginTop: 2, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                Відправлення
                              </div>
                            </div>
                            <div style={{ color: 'var(--rose)', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>→</div>
                            <div>
                              <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-d)', lineHeight: 1.2 }}>
                                {to}
                              </div>
                              <div style={{ fontSize: '0.68rem', color: 'var(--muted-d)', marginTop: 2, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                Прибуття
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Station */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{
                              width: 28, height: 28, borderRadius: '50%',
                              background: 'rgba(196,145,138,0.12)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.75rem', flexShrink: 0,
                            }}>
                              📍
                            </span>
                            <span style={{ color: 'var(--text-d)', fontSize: '0.82rem', fontWeight: 500 }}>
                              {t.station}
                            </span>
                          </div>
                        </td>

                        {/* Departure */}
                        <td>
                          <div style={{ fontWeight: 700, fontFamily: 'var(--font-sans)', color: 'var(--text-d)', fontSize: '1.05rem', lineHeight: 1, letterSpacing: '-0.01em' }}>
                            {fmtTime(t.departureTime)}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--muted-d)', marginTop: 4 }}>
                            {fmtDate(t.departureTime)}
                          </div>
                        </td>

                        {/* Arrival */}
                        <td>
                          <div style={{ fontWeight: 700, fontFamily: 'var(--font-sans)', color: 'var(--text-d)', fontSize: '1.05rem', lineHeight: 1, letterSpacing: '-0.01em' }}>
                            {fmtTime(t.arrivalTime)}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--muted-d)', marginTop: 4 }}>
                            {fmtDate(t.arrivalTime)}
                          </div>
                        </td>

                        {/* Actions */}
                        {isAuthenticated && (
                          <td>
                            {rowCanManage && (
                              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                <button className="icon-btn" onClick={() => openEdit(t)} title="Редагувати" aria-label="Редагувати">✏️</button>
                                <button className="icon-btn danger" onClick={() => handleDelete(t.id)} title="Видалити" aria-label="Видалити">🗑️</button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {isAuthenticated && (
        <button className="fab" onClick={openAdd} aria-label="Додати маршрут">
          +
        </button>
      )}

      {modal && <TrainModal train={editing} onClose={closeModal} onSave={handleSave} />}

      {confirmId !== null && (
        <ConfirmModal
          message="Цю дію не можна скасувати."
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}

      {toast && (
        <div className={`toast toast-${toast.type}`} role="status">
          {toast.msg}
        </div>
      )}
    </>
  );
}
