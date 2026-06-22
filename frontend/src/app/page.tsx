'use client';

import { useState, useEffect } from 'react';
import type { Train, TrainData } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useTrains } from '@/hooks/useTrains';
import { useFavorites } from '@/hooks/useFavorites';
import Navbar from '@/components/Navbar';
import TrainModal from '@/components/TrainModal';
import ConfirmModal from '@/components/ConfirmModal';

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

const pageStyles: Record<string, React.CSSProperties> = {
  main: {
    paddingBottom: 120,
  },
  filterRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
};

const heroStyles: Record<string, React.CSSProperties> = {
  section: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: 'clamp(32px,6vw,56px) clamp(16px,4vw,24px) clamp(24px,5vw,48px)',
  },
  eyebrow: {
    fontSize: '0.72rem',
    fontWeight: 600,
    color: 'var(--accent)',
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    margin: '0 0 18px',
    fontFamily: 'var(--font-sans)',
  },
  h1: {
    fontFamily: 'var(--font-syne)',
    fontWeight: 800,
    fontSize: 'clamp(48px, 8vw, 88px)',
    lineHeight: 0.93,
    color: 'var(--text-l)',
    margin: '0 0 48px',
    letterSpacing: '-0.02em',
  },
};

const toolbarStyles: Record<string, React.CSSProperties> = {
  outer: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '20px clamp(16px,4vw,24px) 12px',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  searchInput: {
    width: '100%',
    padding: '9px 14px 9px 36px',
    background: 'var(--input-bg)',
    border: '1.5px solid var(--border-l)',
    borderRadius: 100,
    color: 'var(--text-l)',
    fontSize: '0.85rem',
    fontFamily: 'var(--font-sans)',
    outline: 'none',
    transition: 'border-color 0.18s, background 0.18s',
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '0.85rem',
    pointerEvents: 'none',
    opacity: 0.35,
  },
  dateInput: {
    padding: '8px 0',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-l)',
    fontSize: '0.82rem',
    fontFamily: 'var(--font-sans)',
    outline: 'none',
  },
  clearBtn: {
    padding: '7px 14px',
    borderRadius: 100,
    border: '1.5px solid rgba(196,145,138,0.35)',
    background: 'transparent',
    color: 'var(--rose)',
    fontSize: '0.78rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    whiteSpace: 'nowrap',
  },
  count: {
    fontSize: '0.8rem',
    color: 'var(--muted-l)',
    margin: '0 0 0 auto',
    fontFamily: 'var(--font-sans)',
    whiteSpace: 'nowrap',
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '9px 18px',
    background: 'var(--accent)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 100,
    fontWeight: 600,
    fontSize: '0.82rem',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    whiteSpace: 'nowrap',
  },
  addBtnIcon: {
    fontSize: '1rem',
    lineHeight: 1,
  },
};

const tableStyles: Record<string, React.CSSProperties> = {
  section: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '4px clamp(0px,3vw,24px) 0',
  },
  scrollWrap: {
    overflowX: 'auto',
    paddingBottom: 4,
  },
  table: {
    minWidth: 580,
  },
  numberBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    padding: '0 12px',
    borderRadius: 100,
    border: '1.5px solid var(--accent)',
    color: 'var(--accent)',
    fontFamily: 'Arial, sans-serif',
    fontWeight: 700,
    fontSize: '0.78rem',
    letterSpacing: '0.04em',
    whiteSpace: 'nowrap',
    minWidth: 64,
    lineHeight: 1,
  },
  directionCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    whiteSpace: 'nowrap',
  },
  cityName: {
    fontFamily: 'var(--font-syne)',
    fontWeight: 700,
    fontSize: '0.95rem',
    color: 'var(--text-d)',
    lineHeight: 1.2,
  },
  cityLabel: {
    fontSize: '0.68rem',
    color: 'var(--muted-d)',
    marginTop: 2,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  arrow: {
    color: 'var(--accent)',
    fontWeight: 700,
    fontSize: '1.1rem',
    flexShrink: 0,
  },
  stationCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  stationIcon: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: 'rgba(196,145,138,0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    flexShrink: 0,
  },
  stationName: {
    color: 'var(--text-d)',
    fontSize: '0.82rem',
    fontWeight: 500,
  },
  timeValue: {
    fontWeight: 700,
    fontFamily: 'var(--font-sans)',
    color: 'var(--text-d)',
    fontSize: '1.05rem',
    lineHeight: 1,
    letterSpacing: '-0.01em',
  },
  timeDate: {
    fontSize: '0.7rem',
    color: 'var(--muted-d)',
    marginTop: 4,
  },
  actionsCell: {
    display: 'flex',
    gap: 6,
    justifyContent: 'flex-end',
  },
};

const mobileCardStyles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  directionWrap: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  directionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
  },
  cityText: {
    fontFamily: 'var(--font-syne)',
    fontWeight: 700,
    fontSize: '0.9rem',
    color: 'var(--text-d)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  arrowSmall: {
    color: 'var(--accent)',
    fontWeight: 700,
    flexShrink: 0,
  },
  actionsRow: {
    display: 'flex',
    gap: 2,
    flexShrink: 0,
  },
  timesRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  timeLabel: {
    fontSize: '0.62rem',
    color: 'var(--muted-d)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 2,
  },
  timeValue: {
    fontWeight: 700,
    fontSize: '1rem',
    color: 'var(--text-d)',
    fontFamily: 'var(--font-sans)',
    letterSpacing: '-0.01em',
    lineHeight: 1,
  },
  timeDate: {
    fontSize: '0.68rem',
    color: 'var(--muted-d)',
    marginTop: 3,
  },
  arrowSep: {
    color: 'var(--accent)',
    fontWeight: 700,
    fontSize: '1.1rem',
    alignSelf: 'center',
  },
  stationRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: '0.75rem',
    color: 'var(--muted-d)',
  },
};

const emptyStyles: Record<string, React.CSSProperties> = {
  wrap: {
    textAlign: 'center',
    padding: '80px 0',
  },
  emoji: {
    fontSize: '3rem',
    marginBottom: 12,
  },
  errorText: {
    color: 'var(--rose)',
    fontSize: '0.95rem',
    fontFamily: 'var(--font-sans)',
  },
  emptyText: {
    color: 'var(--muted-l)',
    fontSize: '0.95rem',
    margin: '0 0 24px',
    fontFamily: 'var(--font-sans)',
  },
  clearBtn: {
    padding: '11px 24px',
    background: 'var(--cream)',
    color: 'var(--text-d)',
    border: 'none',
    borderRadius: 100,
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.88rem',
    fontFamily: 'var(--font-sans)',
  },
  addFirstBtn: {
    padding: '13px 28px',
    background: 'var(--cream)',
    color: 'var(--text-d)',
    border: 'none',
    borderRadius: 100,
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontFamily: 'var(--font-sans)',
  },
};

const favStyles: Record<string, React.CSSProperties> = {
  section: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '32px clamp(16px,4vw,24px) 0',
  },
  divider: {
    margin: '40px auto 0',
  },
  sectionLabel: {
    fontSize: '0.72rem',
    fontWeight: 600,
    color: 'var(--accent)',
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    margin: '0 0 16px',
    fontFamily: 'var(--font-sans)',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  card: {
    background: 'var(--cream)',
    borderRadius: 14,
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
  },
  numberBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 26,
    padding: '0 9px',
    borderRadius: 100,
    border: '1.5px solid var(--accent)',
    color: 'var(--accent)',
    fontFamily: 'Arial, sans-serif',
    fontWeight: 700,
    fontSize: '0.72rem',
    letterSpacing: '0.04em',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    minWidth: 52,
    lineHeight: 1,
  },
  directionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  cityText: {
    fontFamily: 'var(--font-syne)',
    fontWeight: 700,
    fontSize: '0.85rem',
    color: 'var(--text-d)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  arrowText: {
    color: 'var(--accent)',
    fontWeight: 700,
    flexShrink: 0,
  },
  unfavBtn: {
    flexShrink: 0,
  },
};

const skeletonStyles: Record<string, React.CSSProperties> = {
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 7,
  },
  directionGroup: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    flex: '0 0 200px',
  },
};

const skeletonRow = (i: number): React.CSSProperties => ({
  background: 'var(--dark-2)',
  borderRadius: 14,
  padding: '18px 24px',
  display: 'flex',
  gap: 32,
  alignItems: 'center',
  boxShadow: '0 2px 10px rgba(0,0,0,0.14)',
  opacity: 1 - i * 0.12,
});

const heartStyle = (active: boolean): React.CSSProperties => ({
  color: active ? 'var(--accent)' : 'var(--muted-d)',
  fontSize: '1rem',
  lineHeight: 1,
});

type ToastState = { msg: string; type: 'success' | 'error' };

export default function HomePage() {
  const [filter,          setFilter]          = useState<Filter>('all');
  const [search,          setSearch]          = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [departureDate,   setDepartureDate]   = useState('');
  const [arrivalDate,     setArrivalDate]     = useState('');
  const [modal,           setModal]           = useState(false);
  const [editing,         setEditing]         = useState<Train | null>(null);
  const [toast,           setToast]           = useState<ToastState | null>(null);
  const [confirmId,       setConfirmId]       = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const { isAuthenticated, role } = useAuth();
  const isAdmin = role === 'admin';

  const hasFilters = !!(debouncedSearch || departureDate || arrivalDate);

  const { trains, loading, error, create, update, remove } = useTrains({
    search: debouncedSearch,
    departureDate,
    arrivalDate,
  });

  const { favoriteIds, toggle: toggleFavorite } = useFavorites();

  const showToast = (msg: string, type: ToastState['type'] = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const openAdd    = () => { setEditing(null); setModal(true); };
  const openEdit   = (t: Train) => { setEditing(t); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleSave = async (data: TrainData) => {
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

  const handleToggleFavorite = async (trainId: number) => {
    try {
      await toggleFavorite(trainId);
    } catch {
      showToast('Помилка збереження', 'error');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setDepartureDate('');
    setArrivalDate('');
  };

  const visible         = applyFilter(trains, filter);
  const favoritedTrains = trains.filter(t => favoriteIds.has(t.id));

  return (
    <>
      <Navbar />

      <main style={pageStyles.main}>

        <section style={heroStyles.section}>
          <p style={heroStyles.eyebrow}>
            Розклад потягів України
          </p>
          <h1 style={heroStyles.h1}>
            Знайди<br />свій поїзд
          </h1>
          <div style={pageStyles.filterRow}>
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

        <div style={toolbarStyles.outer}>
          <div style={toolbarStyles.row}>

            <div className="toolbar-search">
              <span style={toolbarStyles.searchIcon}>🔍</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Поїзд, місто..."
                style={toolbarStyles.searchInput}
                onFocus={e => { e.target.style.borderColor = 'var(--rose)'; }}
                onBlur={e =>  { e.target.style.borderColor = 'var(--border-l)'; }}
              />
            </div>

            {(['departure', 'arrival'] as const).map(type => (
              <div key={type} className="date-filter-item">
                <span className="datepill-label">
                  {type === 'departure' ? 'Відправлення' : 'Прибуття'}
                </span>
                <input
                  type="date"
                  value={type === 'departure' ? departureDate : arrivalDate}
                  onChange={e => type === 'departure' ? setDepartureDate(e.target.value) : setArrivalDate(e.target.value)}
                  style={toolbarStyles.dateInput}
                />
              </div>
            ))}

            {hasFilters && (
              <button onClick={clearFilters} style={toolbarStyles.clearBtn}>
                × Скинути
              </button>
            )}

            {!loading && (
              <p style={toolbarStyles.count}>
                {visible.length > 0
                  ? `${visible.length} маршрут${visible.length === 1 ? '' : visible.length < 5 ? 'и' : 'ів'}`
                  : 'Нічого не знайдено'}
              </p>
            )}

            {isAdmin && (
              <button onClick={openAdd} style={toolbarStyles.addBtn}>
                <span style={toolbarStyles.addBtnIcon}>+</span>
                Додати маршрут
              </button>
            )}
          </div>
        </div>

        <section style={tableStyles.section}>
          {loading ? (
            <div style={skeletonStyles.list}>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} style={skeletonRow(i)}>
                  <div className="skeleton" style={{ height: 28, width: 72, borderRadius: 100 }} />
                  <div style={skeletonStyles.directionGroup}>
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
            <div style={emptyStyles.wrap}>
              <p style={emptyStyles.errorText}>{error}</p>
            </div>
          ) : visible.length === 0 ? (
            <div style={emptyStyles.wrap}>
              <p style={emptyStyles.emoji}>🚂</p>
              <p style={emptyStyles.emptyText}>
                {hasFilters
                  ? 'Нічого не знайдено за вашим запитом'
                  : filter === 'all'
                    ? 'Маршрутів поки немає'
                    : `Немає маршрутів для «${FILTERS.find(f => f.key === filter)?.label}»`}
              </p>
              {hasFilters && (
                <button onClick={clearFilters} style={emptyStyles.clearBtn}>
                  Скинути фільтри
                </button>
              )}
              {isAdmin && !hasFilters && filter === 'all' && (
                <button onClick={openAdd} style={emptyStyles.addFirstBtn}>
                  Додати перший маршрут
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="desktop-table-wrap" style={tableStyles.scrollWrap}>
                <table className="schedule-table" style={tableStyles.table}>
                  <thead>
                    <tr>
                      <th>Номер</th>
                      <th>Напрямок</th>
                      <th className="col-station">Станція</th>
                      <th>Відправлення</th>
                      <th>Прибуття</th>
                      {isAuthenticated && <th />}
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map(t => {
                      const [from, to] = t.direction.split(' → ');
                      const isFav = favoriteIds.has(t.id);
                      return (
                        <tr key={t.id}>
                          <td>
                            <span style={tableStyles.numberBadge}>{t.trainNumber}</span>
                          </td>
                          <td>
                            <div style={tableStyles.directionCell}>
                              <div>
                                <div style={tableStyles.cityName}>{from}</div>
                                <div style={tableStyles.cityLabel}>Відправлення</div>
                              </div>
                              <div style={tableStyles.arrow}>→</div>
                              <div>
                                <div style={tableStyles.cityName}>{to}</div>
                                <div style={tableStyles.cityLabel}>Прибуття</div>
                              </div>
                            </div>
                          </td>
                          <td className="col-station">
                            <div style={tableStyles.stationCell}>
                              <span style={tableStyles.stationIcon}>📍</span>
                              <span style={tableStyles.stationName}>{t.station}</span>
                            </div>
                          </td>
                          <td>
                            <div style={tableStyles.timeValue}>{fmtTime(t.departureTime)}</div>
                            <div style={tableStyles.timeDate}>{fmtDate(t.departureTime)}</div>
                          </td>
                          <td>
                            <div style={tableStyles.timeValue}>{fmtTime(t.arrivalTime)}</div>
                            <div style={tableStyles.timeDate}>{fmtDate(t.arrivalTime)}</div>
                          </td>
                          {isAuthenticated && (
                            <td>
                              <div style={tableStyles.actionsCell}>
                                <button
                                  className="icon-btn"
                                  onClick={() => handleToggleFavorite(t.id)}
                                  title={isFav ? 'Видалити з обраних' : 'Додати до обраних'}
                                  aria-label={isFav ? 'Видалити з обраних' : 'Додати до обраних'}
                                >
                                  <span style={heartStyle(isFav)}>
                                    {isFav ? '♥' : '♡'}
                                  </span>
                                </button>
                                {isAdmin && (
                                  <>
                                    <button className="icon-btn" onClick={() => openEdit(t)} title="Редагувати" aria-label="Редагувати">✏️</button>
                                    <button className="icon-btn danger" onClick={() => handleDelete(t.id)} title="Видалити" aria-label="Видалити">🗑️</button>
                                  </>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mobile-cards">
                {visible.map(t => {
                  const [from, to] = t.direction.split(' → ');
                  const isFav = favoriteIds.has(t.id);
                  return (
                    <div key={t.id} className="train-card-mobile">
                      <div style={mobileCardStyles.header}>
                        <span style={tableStyles.numberBadge}>{t.trainNumber}</span>
                        <div style={mobileCardStyles.directionWrap}>
                          <div style={mobileCardStyles.directionRow}>
                            <span style={mobileCardStyles.cityText}>{from?.trim()}</span>
                            <span style={mobileCardStyles.arrowSmall}>→</span>
                            <span style={mobileCardStyles.cityText}>{to?.trim()}</span>
                          </div>
                        </div>
                        {isAuthenticated && (
                          <div style={mobileCardStyles.actionsRow}>
                            <button
                              className="icon-btn"
                              onClick={() => handleToggleFavorite(t.id)}
                              title={isFav ? 'Видалити з обраних' : 'Додати до обраних'}
                              aria-label={isFav ? 'Видалити з обраних' : 'Додати до обраних'}
                            >
                              <span style={heartStyle(isFav)}>{isFav ? '♥' : '♡'}</span>
                            </button>
                            {isAdmin && (
                              <>
                                <button className="icon-btn" onClick={() => openEdit(t)} title="Редагувати" aria-label="Редагувати">✏️</button>
                                <button className="icon-btn danger" onClick={() => handleDelete(t.id)} title="Видалити" aria-label="Видалити">🗑️</button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      <div style={mobileCardStyles.timesRow}>
                        <div>
                          <div style={mobileCardStyles.timeLabel}>Відправлення</div>
                          <div style={mobileCardStyles.timeValue}>{fmtTime(t.departureTime)}</div>
                          <div style={mobileCardStyles.timeDate}>{fmtDate(t.departureTime)}</div>
                        </div>
                        <span style={mobileCardStyles.arrowSep}>→</span>
                        <div>
                          <div style={mobileCardStyles.timeLabel}>Прибуття</div>
                          <div style={mobileCardStyles.timeValue}>{fmtTime(t.arrivalTime)}</div>
                          <div style={mobileCardStyles.timeDate}>{fmtDate(t.arrivalTime)}</div>
                        </div>
                      </div>
                      <div style={mobileCardStyles.stationRow}>
                        <span>📍</span>
                        <span>{t.station}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {isAuthenticated && favoritedTrains.length > 0 && (
          <>
            <div className="section-divider" style={favStyles.divider} />
            <section style={favStyles.section}>
              <p style={favStyles.sectionLabel}>
                Збережені маршрути
              </p>
              <div style={favStyles.list}>
                {favoritedTrains.map(t => {
                  const [from, to] = t.direction.split(' → ');
                  return (
                    <div key={t.id} style={favStyles.card}>
                      <span style={favStyles.numberBadge}>
                        {t.trainNumber}
                      </span>
                      <div style={favStyles.directionRow}>
                        <span style={favStyles.cityText}>{from}</span>
                        <span style={favStyles.arrowText}>→</span>
                        <span style={favStyles.cityText}>{to}</span>
                      </div>
                      <button
                        className="icon-btn"
                        onClick={() => handleToggleFavorite(t.id)}
                        title="Видалити з обраних"
                        aria-label="Видалити з обраних"
                        style={favStyles.unfavBtn}
                      >
                        <span style={heartStyle(true)}>♥</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}

      </main>

      {isAdmin && (
        <button className="fab" onClick={openAdd} aria-label="Додати маршрут">+</button>
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
