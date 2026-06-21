'use client';

import { useState } from 'react';
import type { Trip } from '@/types';

interface Props {
  trips: Trip[];
  onDelete: (id: number) => Promise<void>;
}

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
const MONTHS = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'];

function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function firstDow(y: number, m: number) { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; }
function pad(n: number) { return String(n).padStart(2, '0'); }
function ds(y: number, m: number, d: number) { return `${y}-${pad(m + 1)}-${pad(d)}`; }

const fmtTime = (s: string) => new Date(s).toLocaleString('uk-UA', { hour: '2-digit', minute: '2-digit' });

export default function TripCalendar({ trips, onDelete }: Props) {
  const now = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [sel,   setSel]   = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); setSel(null); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); setSel(null); };

  const byDate = new Map<string, Trip[]>();
  for (const t of trips) {
    if (!byDate.has(t.tripDate)) byDate.set(t.tripDate, []);
    byDate.get(t.tripDate)!.push(t);
  }

  const dim   = daysInMonth(year, month);
  const start = firstDow(year, month);
  const cells = Math.ceil((start + dim) / 7) * 7;
  const todayStr = ds(now.getFullYear(), now.getMonth(), now.getDate());

  const selTrips = sel ? (byDate.get(sel) ?? []) : [];

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await onDelete(id);
      if (sel && (byDate.get(sel)?.length ?? 0) <= 1) setSel(null);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ background: 'var(--cream)', borderRadius: 20, padding: '24px', boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>

      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button
          onClick={prevMonth}
          style={{ width: 34, height: 34, borderRadius: '50%', border: '1.5px solid var(--border-d)', background: 'transparent', cursor: 'pointer', fontSize: '1rem', color: 'var(--muted-d)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          aria-label="Попередній місяць"
        >‹</button>
        <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-d)' }}>
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          style={{ width: 34, height: 34, borderRadius: '50%', border: '1.5px solid var(--border-d)', background: 'transparent', cursor: 'pointer', fontSize: '1rem', color: 'var(--muted-d)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          aria-label="Наступний місяць"
        >›</button>
      </div>

      {/* Day labels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.62rem', fontWeight: 700, color: 'var(--muted-d)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 0', fontFamily: 'var(--font-sans)' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {Array.from({ length: cells }, (_, i) => {
          const day = i - start + 1;
          if (day < 1 || day > dim) return <div key={i} />;
          const date     = ds(year, month, day);
          const hasTrips = byDate.has(date);
          const isToday  = date === todayStr;
          const isSel    = date === sel;
          const count    = byDate.get(date)?.length ?? 0;
          return (
            <button
              key={i}
              onClick={() => hasTrips && setSel(isSel ? null : date)}
              aria-pressed={isSel}
              style={{
                position: 'relative',
                paddingTop: '100%',
                borderRadius: 10,
                border: isSel
                  ? '2px solid var(--rose)'
                  : isToday
                    ? '2px solid rgba(196,145,138,0.5)'
                    : '1.5px solid transparent',
                background: isSel
                  ? 'var(--rose)'
                  : isToday
                    ? 'rgba(196,145,138,0.1)'
                    : hasTrips
                      ? 'rgba(196,145,138,0.06)'
                      : 'transparent',
                cursor: hasTrips ? 'pointer' : 'default',
                transition: 'background 0.15s, border-color 0.15s',
              }}
            >
              <span style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
              }}>
                <span style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.82rem',
                  fontWeight: isToday || hasTrips ? 700 : 400,
                  color: isSel ? 'white' : 'var(--text-d)',
                  lineHeight: 1,
                }}>
                  {day}
                </span>
                {hasTrips && (
                  <span style={{
                    display: 'flex',
                    gap: 2,
                  }}>
                    {Array.from({ length: Math.min(count, 3) }, (_, j) => (
                      <span key={j} style={{
                        width: 4, height: 4, borderRadius: '50%',
                        background: isSel ? 'rgba(255,255,255,0.7)' : 'var(--rose)',
                        display: 'inline-block',
                      }} />
                    ))}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected day detail */}
      {sel && selTrips.length > 0 && (
        <div style={{ marginTop: 20, borderTop: '1.5px solid rgba(26,21,17,0.1)', paddingTop: 18 }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--rose)', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 12px', fontFamily: 'var(--font-sans)' }}>
            {new Date(sel + 'T12:00').toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {selTrips.map(trip => {
              const [from, to] = trip.train.direction.split(' → ');
              return (
                <div
                  key={trip.id}
                  style={{ background: 'rgba(26,21,17,0.04)', borderRadius: 12, padding: '14px 16px', border: '1.5px solid rgba(26,21,17,0.07)' }}
                >
                  {/* Train row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ padding: '3px 9px', borderRadius: 100, border: '1.5px solid var(--rose)', color: 'var(--rose)', fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.06em', flexShrink: 0 }}>
                      {trip.train.trainNumber}
                    </span>
                    <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-d)' }}>{from}</span>
                    <span style={{ color: 'var(--rose)', fontWeight: 700, flexShrink: 0 }}>→</span>
                    <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-d)' }}>{to}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--muted-d)', whiteSpace: 'nowrap', fontFamily: 'var(--font-sans)' }}>
                      {fmtTime(trip.train.departureTime)} → {fmtTime(trip.train.arrivalTime)}
                    </span>
                  </div>

                  {/* Note */}
                  {trip.note && (
                    <p style={{ margin: '10px 0 0', fontSize: '0.82rem', color: 'var(--muted-d)', fontStyle: 'italic', fontFamily: 'var(--font-sans)', lineHeight: 1.5 }}>
                      {trip.note}
                    </p>
                  )}

                  {/* Delete */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                    <button
                      onClick={() => handleDelete(trip.id)}
                      disabled={deletingId === trip.id}
                      style={{ padding: '5px 14px', borderRadius: 100, border: '1.5px solid rgba(180,60,60,0.3)', background: 'transparent', color: deletingId === trip.id ? 'var(--muted-d)' : '#8B3030', fontSize: '0.75rem', fontWeight: 600, cursor: deletingId === trip.id ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-sans)' }}
                    >
                      {deletingId === trip.id ? '...' : 'Видалити'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
