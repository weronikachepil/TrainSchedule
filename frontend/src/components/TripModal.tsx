'use client';

import { useState } from 'react';
import type { Train } from '@/types';

interface Props {
  train: Train;
  onClose: () => void;
  onSave: (tripDate: string, note?: string) => Promise<void>;
}

const fmtTime = (d: string) =>
  new Date(d).toLocaleString('uk-UA', { hour: '2-digit', minute: '2-digit' });

const lbl: React.CSSProperties = {
  display: 'block',
  fontSize: '0.7rem',
  fontWeight: 600,
  color: 'var(--muted-d)',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  marginBottom: 6,
  fontFamily: 'var(--font-sans)',
};

export default function TripModal({ train, onClose, onSave }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const [tripDate, setTripDate] = useState(today);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [from, to] = train.direction.split(' → ');

  const handleSave = async () => {
    if (!tripDate) { setError('Оберіть дату подорожі'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave(tripDate, note.trim() || undefined);
      onClose();
    } catch {
      setError('Помилка збереження — спробуйте ще раз');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={e => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-card">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--rose)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 3px', fontFamily: 'var(--font-sans)' }}>
              Планування подорожі
            </p>
            <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '1.8rem', color: 'var(--text-d)', margin: 0, letterSpacing: '-0.01em' }}>
              Запланувати поїздку
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Закрити"
            style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--border-d)', background: 'transparent', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--muted-d)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            ×
          </button>
        </div>

        {/* Train info */}
        <div style={{ background: 'rgba(26,21,17,0.05)', borderRadius: 14, padding: '14px 18px', marginBottom: 20, border: '1.5px solid var(--border-d)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ padding: '3px 10px', borderRadius: 100, border: '1.5px solid var(--rose)', color: 'var(--rose)', fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.06em' }}>
              {train.trainNumber}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-d)', lineHeight: 1.2 }}>{from}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--muted-d)', marginTop: 2, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{fmtTime(train.departureTime)}</div>
            </div>
            <div style={{ color: 'var(--rose)', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>→</div>
            <div>
              <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-d)', lineHeight: 1.2 }}>{to}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--muted-d)', marginTop: 2, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{fmtTime(train.arrivalTime)}</div>
            </div>
          </div>
        </div>

        {/* Date picker */}
        <div style={{ marginBottom: 16 }}>
          <span style={lbl}>Дата подорожі</span>
          <input
            type="date"
            className="field-cream"
            value={tripDate}
            min={today}
            onChange={e => setTripDate(e.target.value)}
          />
        </div>

        {/* Note */}
        <div style={{ marginBottom: 20 }}>
          <span style={lbl}>Коментар <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, opacity: 0.6 }}>(необов'язково)</span></span>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Нотатки до поїздки..."
            rows={3}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(26,21,17,0.04)',
              border: '1.5px solid var(--border-d)',
              borderRadius: 12,
              color: 'var(--text-d)',
              fontSize: '0.88rem',
              fontFamily: 'var(--font-sans)',
              outline: 'none',
              resize: 'vertical',
              boxSizing: 'border-box',
              transition: 'border-color 0.18s',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--rose)'; }}
            onBlur={e =>  { e.target.style.borderColor = 'var(--border-d)'; }}
          />
        </div>

        {error && (
          <div style={{ background: 'rgba(180,60,60,0.08)', border: '1px solid rgba(180,60,60,0.2)', borderRadius: 10, padding: '10px 14px', color: '#8B3030', fontSize: '0.875rem', marginBottom: 16 }}>
            {error}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            style={{ flex: 1, padding: '13px', border: '1.5px solid var(--border-d)', borderRadius: 12, background: 'transparent', color: 'var(--muted-d)', fontWeight: 500, cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'var(--font-sans)' }}
          >
            Скасувати
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{ flex: 2, padding: '13px', border: 'none', borderRadius: 12, background: saving ? 'rgba(26,21,17,0.35)' : 'var(--dark)', color: 'var(--cream)', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.9rem', fontFamily: 'var(--font-sans)', transition: 'background 0.18s' }}
          >
            {saving ? 'Збереження...' : 'Запланувати'}
          </button>
        </div>
      </div>
    </div>
  );
}
