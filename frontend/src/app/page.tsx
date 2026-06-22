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

      <main className="pb-[120px]">

        <section className="max-w-[1200px] mx-auto px-[clamp(16px,4vw,24px)] pt-[clamp(32px,6vw,56px)] pb-[clamp(24px,5vw,48px)]">
          <p className="text-[0.72rem] font-semibold text-accent tracking-[0.16em] uppercase mb-[18px] font-sans m-0">
            Розклад потягів України
          </p>
          <h1 className="font-headline font-extrabold text-[clamp(48px,8vw,88px)] leading-[0.93] text-tl mb-[48px] tracking-[-0.02em] m-0">
            Знайди<br />свій поїзд
          </h1>
          <div className="flex gap-2 flex-wrap">
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

        <div className="max-w-[1200px] mx-auto px-[clamp(16px,4vw,24px)] pt-5 pb-3">
          <div className="flex items-center gap-[10px] flex-wrap">

            <div className="toolbar-search">
              <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[0.85rem] pointer-events-none opacity-35">🔍</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Поїзд, місто..."
                className="w-full py-[9px] pr-[14px] pl-9 bg-ibg border-15-bl rounded-full text-tl text-[0.85rem] font-sans outline-none transition-all duration-200"
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
                  className="py-2 bg-transparent border-none text-tl text-[0.82rem] font-sans outline-none"
                />
              </div>
            ))}

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="py-[7px] px-[14px] rounded-full border border-[rgba(196,145,138,0.35)] bg-transparent text-rose text-[0.78rem] font-semibold cursor-pointer font-sans whitespace-nowrap"
              >
                × Скинути
              </button>
            )}

            {!loading && (
              <p className="text-[0.8rem] text-ml ml-auto font-sans whitespace-nowrap m-0">
                {visible.length > 0
                  ? `${visible.length} маршрут${visible.length === 1 ? '' : visible.length < 5 ? 'и' : 'ів'}`
                  : 'Нічого не знайдено'}
              </p>
            )}

            {isAdmin && (
              <button
                onClick={openAdd}
                className="flex items-center gap-[6px] py-[9px] px-[18px] bg-accent text-white border-none rounded-full font-semibold text-[0.82rem] cursor-pointer font-sans whitespace-nowrap"
              >
                <span className="text-base leading-none">+</span>
                Додати маршрут
              </button>
            )}
          </div>
        </div>

        <section className="max-w-[1200px] mx-auto px-[clamp(0px,3vw,24px)] pt-1">
          {loading ? (
            <div className="flex flex-col gap-[7px]">
              {[1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  className="bg-dark-2 rounded-[14px] py-[18px] px-6 flex gap-8 items-center shadow-[0_2px_10px_rgba(0,0,0,0.14)]"
                  style={{ opacity: 1 - i * 0.12 }}
                >
                  <div className="skeleton h-7 w-[72px] rounded-full" />
                  <div className="flex gap-[10px] items-center basis-[200px] shrink-0">
                    <div className="skeleton h-[14px] w-[70px] rounded" />
                    <div className="skeleton h-[10px] w-4 rounded" />
                    <div className="skeleton h-[14px] w-[70px] rounded" />
                  </div>
                  <div className="skeleton h-[14px] w-[140px] rounded" />
                  <div className="skeleton h-[18px] w-[55px] rounded" />
                  <div className="skeleton h-[18px] w-[55px] rounded" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-[80px]">
              <p className="text-rose text-[0.95rem] font-sans m-0">{error}</p>
            </div>
          ) : visible.length === 0 ? (
            <div className="text-center py-[80px]">
              <p className="text-[3rem] mb-3 m-0">🚂</p>
              <p className="text-ml text-[0.95rem] mb-6 font-sans m-0">
                {hasFilters
                  ? 'Нічого не знайдено за вашим запитом'
                  : filter === 'all'
                    ? 'Маршрутів поки немає'
                    : `Немає маршрутів для «${FILTERS.find(f => f.key === filter)?.label}»`}
              </p>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="py-[11px] px-6 bg-cream text-td border-none rounded-full font-semibold cursor-pointer text-[0.88rem] font-sans"
                >
                  Скинути фільтри
                </button>
              )}
              {isAdmin && !hasFilters && filter === 'all' && (
                <button
                  onClick={openAdd}
                  className="py-[13px] px-7 bg-cream text-td border-none rounded-full font-semibold cursor-pointer text-[0.9rem] font-sans"
                >
                  Додати перший маршрут
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="desktop-table-wrap overflow-x-auto pb-1">
                <table className="schedule-table min-w-[580px]">
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
                      const isFav = favoriteIds.has(t.id);
                      return (
                        <tr key={t.id}>
                          <td>
                            <span className="number-badge h-[30px] px-3 text-[0.78rem] min-w-[64px]">
                              {t.trainNumber}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center gap-[10px] whitespace-nowrap">
                              <div>
                                <div className="font-headline font-bold text-[0.95rem] text-td leading-[1.2]">{from}</div>
                                <div className="text-[0.68rem] text-md mt-[2px] tracking-[0.06em] uppercase">Відправлення</div>
                              </div>
                              <div className="text-accent font-bold text-[1.1rem] shrink-0">→</div>
                              <div>
                                <div className="font-headline font-bold text-[0.95rem] text-td leading-[1.2]">{to}</div>
                                <div className="text-[0.68rem] text-md mt-[2px] tracking-[0.06em] uppercase">Прибуття</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center gap-[6px]">
                              <span className="w-7 h-7 rounded-full bg-[rgba(196,145,138,0.12)] flex items-center justify-center text-[0.75rem] shrink-0">📍</span>
                              <span className="text-td text-[0.82rem] font-medium">{t.station}</span>
                            </div>
                          </td>
                          <td>
                            <div className="font-bold font-sans text-td text-[1.05rem] leading-none tracking-[-0.01em]">{fmtTime(t.departureTime)}</div>
                            <div className="text-[0.7rem] text-md mt-1">{fmtDate(t.departureTime)}</div>
                          </td>
                          <td>
                            <div className="font-bold font-sans text-td text-[1.05rem] leading-none tracking-[-0.01em]">{fmtTime(t.arrivalTime)}</div>
                            <div className="text-[0.7rem] text-md mt-1">{fmtDate(t.arrivalTime)}</div>
                          </td>
                          {isAuthenticated && (
                            <td>
                              <div className="flex gap-[6px] justify-end">
                                <button
                                  className="icon-btn"
                                  onClick={() => handleToggleFavorite(t.id)}
                                  title={isFav ? 'Видалити з обраних' : 'Додати до обраних'}
                                  aria-label={isFav ? 'Видалити з обраних' : 'Додати до обраних'}
                                >
                                  <span className={`text-base leading-none ${isFav ? 'text-accent' : 'text-md'}`}>
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
                      <div className="flex items-center gap-[10px] mb-[10px]">
                        <span className="number-badge h-[30px] px-3 text-[0.78rem] min-w-[64px]">
                          {t.trainNumber}
                        </span>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="flex items-center gap-[5px]">
                            <span className="font-headline font-bold text-[0.9rem] text-td overflow-hidden text-ellipsis whitespace-nowrap">{from?.trim()}</span>
                            <span className="text-accent font-bold shrink-0">→</span>
                            <span className="font-headline font-bold text-[0.9rem] text-td overflow-hidden text-ellipsis whitespace-nowrap">{to?.trim()}</span>
                          </div>
                        </div>
                        {isAuthenticated && (
                          <div className="flex gap-[2px] shrink-0">
                            <button className="icon-btn" onClick={() => handleToggleFavorite(t.id)} title={isFav ? 'Видалити з обраних' : 'Додати до обраних'} aria-label={isFav ? 'Видалити з обраних' : 'Додати до обраних'}>
                              <span className={`text-base leading-none ${isFav ? 'text-accent' : 'text-md'}`}>{isFav ? '♥' : '♡'}</span>
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
                      <div className="flex items-center gap-4 mb-2">
                        <div>
                          <div className="text-[0.62rem] text-md uppercase tracking-[0.06em] mb-[2px]">Відправлення</div>
                          <div className="font-bold text-[1rem] text-td font-sans tracking-[-0.01em] leading-none">{fmtTime(t.departureTime)}</div>
                          <div className="text-[0.68rem] text-md mt-[3px]">{fmtDate(t.departureTime)}</div>
                        </div>
                        <span className="text-accent font-bold text-[1.1rem] self-center">→</span>
                        <div>
                          <div className="text-[0.62rem] text-md uppercase tracking-[0.06em] mb-[2px]">Прибуття</div>
                          <div className="font-bold text-[1rem] text-td font-sans tracking-[-0.01em] leading-none">{fmtTime(t.arrivalTime)}</div>
                          <div className="text-[0.68rem] text-md mt-[3px]">{fmtDate(t.arrivalTime)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-[5px] text-[0.75rem] text-md">
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
            <div className="section-divider mt-10" />
            <section className="max-w-[1200px] mx-auto px-[clamp(16px,4vw,24px)] pt-8">
              <p className="text-[0.72rem] font-semibold text-accent tracking-[0.16em] uppercase mb-4 font-sans m-0">
                Збережені маршрути
              </p>
              <div className="flex flex-col gap-2">
                {favoritedTrains.map(t => {
                  const [from, to] = t.direction.split(' → ');
                  return (
                    <div key={t.id} className="bg-cream rounded-[14px] py-3 px-4 flex items-center gap-3 shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
                      <span className="number-badge h-[26px] px-[9px] text-[0.72rem] min-w-[52px] shrink-0">
                        {t.trainNumber}
                      </span>
                      <div className="flex items-center gap-[6px] flex-1 min-w-0 overflow-hidden">
                        <span className="font-headline font-bold text-[0.85rem] text-td overflow-hidden text-ellipsis whitespace-nowrap">{from}</span>
                        <span className="text-accent font-bold shrink-0">→</span>
                        <span className="font-headline font-bold text-[0.85rem] text-td overflow-hidden text-ellipsis whitespace-nowrap">{to}</span>
                      </div>
                      <button
                        className="icon-btn shrink-0"
                        onClick={() => handleToggleFavorite(t.id)}
                        title="Видалити з обраних"
                        aria-label="Видалити з обраних"
                      >
                        <span className="text-accent text-base leading-none">♥</span>
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
