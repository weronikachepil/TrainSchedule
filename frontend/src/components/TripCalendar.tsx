'use client';

import { useState } from 'react';
import type { Trip } from '@/types';

interface Props {
  trips: Trip[];
  onDelete: (id: number) => Promise<void>;
}

const DAYS   = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
const MONTHS = ['Січень','Лютий','Березень','Квітень','Травень','Червень','Липень','Серпень','Вересень','Жовтень','Листопад','Грудень'];

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
    <div style={{ background: 'var(--cream)', borderRadius: 18, padding: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.09)' }}>

      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button onClick={prevMonth} aria-label="Попередній місяць" style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid var(--border-d)', background: 'transparent', cursor: 'pointer', fontSize: '0.95rem', color: 'var(--muted-d)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
        <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-d)' }}>
          {MONTHS[month]} {year}
        </span>
        <button onClick={nextMonth} aria-label="Наступний місяць" style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid var(--border-d)', background: 'transparent', cursor: 'pointer', fontSize: '0.95rem', color: 'var(--muted-d)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
      </div>

      {/* Day labels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 4 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.58rem', fontWeight: 700, color: 'var(--muted-d)', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '3px 0', fontFamily: 'var(--font-sans)' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
        {Array.from({ length: cells }, (_, i) => {
          const day = i - start + 1;
          if (day < 1 || day > dim) return <div key={i} style={{ height: 32 }} />;
          const date     = ds(year, month, day);
          const hasTrips = byDate.has(date);
          const isToday  = date === todayStr;
          const isSel    = date === sel;
          return (
            <button
              key={i}
              onClick={() => hasTrips && setSel(isSel ? null : date)}
              aria-pressed={isSel}
              style={{
                height: 32,
                borderRadius: 8,
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
                      ? 'rgba(196,145,138,0.07)'
                      : 'transparent',
                cursor: hasTrips ? 'pointer' : 'default',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                padding: 0,
                transition: 'background 0.15s',
              }}
            >
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.76rem', fontWeight: isToday || hasTrips ? 700 : 400, color: isSel ? 'white' : 'var(--text-d)', lineHeight: 1 }}>
                {day}
              </span>
              {hasTrips && (
                <span style={{ display: 'flex', gap: 2 }}>
                  {Array.from({ length: Math.min(byDate.get(date)!.length, 3) }, (_, j) => (
                    <span key={j} style={{ width: 3, height: 3, borderRadius: '50%', background: isSel ? 'rgba(255,255,255,0.8)' : 'var(--rose)', display: 'inline-block' }} />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day detail */}
      {sel && selTrips.length > 0 && (
        <div style={{ marginTop: 14, borderTop: '1.5px solid rgba(26,21,17,0.1)', paddingTop: 14 }}>
          <p style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--rose)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 10px', fontFamily: 'var(--font-sans)' }}>
            {new Date(sel + 'T12:00').toLocaleDateString('uk-UA', { weekday: 'short', day: 'numeric', month: 'short' })}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {selTrips.map(trip => {
              const [from, to] = trip.train.direction.split(' → ');
              return (
                <div key={trip.id} style={{ background: 'rgba(26,21,17,0.04)', borderRadius: 10, padding: '10px 12px', border: '1.5px solid rgba(26,21,17,0.07)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 100, border: '1.5px solid var(--rose)', color: 'var(--rose)', fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.05em', flexShrink: 0 }}>
                      {trip.train.trainNumber}
                    </span>
                    <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-d)' }}>{from}</span>
                    <span style={{ color: 'var(--rose)', fontWeight: 700, fontSize: '0.82rem', flexShrink: 0 }}>→</span>
                    <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-d)' }}>{to}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: 'var(--muted-d)', whiteSpace: 'nowrap', fontFamily: 'var(--font-sans)' }}>
                      {fmtTime(trip.train.departureTime)} → {fmtTime(trip.train.arrivalTime)}
                    </span>
                  </div>
                  {trip.note && (
                    <p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: 'var(--muted-d)', fontStyle: 'italic', fontFamily: 'var(--font-sans)', lineHeight: 1.4 }}>
                      {trip.note}
                    </p>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                    <button
                      onClick={() => handleDelete(trip.id)}
                      disabled={deletingId === trip.id}
                      style={{ padding: '4px 12px', borderRadius: 100, border: '1.5px solid rgba(180,60,60,0.3)', background: 'transparent', color: deletingId === trip.id ? 'var(--muted-d)' : '#8B3030', fontSize: '0.7rem', fontWeight: 600, cursor: deletingId === trip.id ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-sans)' }}
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
