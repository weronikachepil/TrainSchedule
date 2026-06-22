'use client';

import { useState, useEffect } from 'react';
import type { Train, TrainData } from '@/types';
import { STATIONS } from '@/types';

interface Props {
  train: Train | null;
  onClose: () => void;
  onSave: (data: TrainData) => Promise<void>;
}

function toLocal(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const z = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}T${z(d.getHours())}:${z(d.getMinutes())}`;
}

const focusField  = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.target.style.borderColor = 'var(--rose)';
  e.target.style.background  = 'rgba(255,255,255,0.7)';
};
const blurField = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.target.style.borderColor = 'var(--border-d)';
  e.target.style.background  = 'rgba(26,21,17,0.04)';
};

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

const headerStyles = {
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 } as React.CSSProperties,
  eyebrow: { fontSize: '0.7rem', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 3px', fontFamily: 'var(--font-sans)' } as React.CSSProperties,
  title: { fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '1.8rem', color: 'var(--text-d)', margin: 0, letterSpacing: '-0.01em' } as React.CSSProperties,
  closeBtn: {
    width: 36, height: 36, borderRadius: '50%',
    border: '1.5px solid var(--border-d)',
    background: 'transparent', cursor: 'pointer',
    fontSize: '1.1rem', lineHeight: 1,
    color: 'var(--muted-d)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  } as React.CSSProperties,
};

const formStyles = {
  form: { display: 'flex', flexDirection: 'column', gap: 15 } as React.CSSProperties,
  directionGrid: { display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 10, alignItems: 'end' } as React.CSSProperties,
  directionArrow: { paddingBottom: 2, color: 'var(--rose)', fontWeight: 700, fontSize: '1rem', textAlign: 'center' } as React.CSSProperties,
  timesGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } as React.CSSProperties,
  errorBox: { background: 'rgba(180,60,60,0.08)', border: '1px solid rgba(180,60,60,0.2)', borderRadius: 10, padding: '10px 14px', color: '#8B3030', fontSize: '0.875rem' } as React.CSSProperties,
  btnRow: { display: 'flex', gap: 10, marginTop: 4 } as React.CSSProperties,
  cancelBtn: {
    flex: 1, padding: '13px',
    border: '1.5px solid var(--border-d)', borderRadius: 12,
    background: 'transparent', color: 'var(--muted-d)',
    fontWeight: 500, cursor: 'pointer',
    fontSize: '0.9rem', fontFamily: 'var(--font-sans)',
  } as React.CSSProperties,
  submitBtn: (saving: boolean): React.CSSProperties => ({
    flex: 2, padding: '13px',
    border: 'none', borderRadius: 12,
    background: saving ? 'rgba(26,21,17,0.35)' : 'var(--dark)',
    color: 'var(--cream)', fontWeight: 600,
    cursor: saving ? 'not-allowed' : 'pointer',
    fontSize: '0.9rem', fontFamily: 'var(--font-sans)',
    transition: 'background 0.18s',
  }),
};

export default function TrainModal({ train, onClose, onSave }: Props) {
  const [trainNumber, setTrainNumber] = useState('');
  const [from, setFrom] = useState<string>(STATIONS[0]);
  const [to,   setTo]   = useState<string>(STATIONS[1]);
  const [dep,  setDep]  = useState('');
  const [arr,  setArr]  = useState('');
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  useEffect(() => {
    if (!train) return;
    setTrainNumber(train.trainNumber);
    const parts = train.direction.split(' → ');
    setFrom(parts[0] ?? STATIONS[0]);
    setTo(parts[1]   ?? STATIONS[1]);
    setDep(toLocal(train.departureTime));
    setArr(toLocal(train.arrivalTime));
  }, [train]);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!trainNumber.trim())             { setError('Введіть номер поїзда'); return; }
    if (from === to)                     { setError('Станції мають різнитись'); return; }
    if (!dep)                            { setError('Оберіть час відправлення'); return; }
    if (!arr)                            { setError('Оберіть час прибуття'); return; }
    if (new Date(dep) >= new Date(arr))  { setError('Прибуття має бути пізніше відправлення'); return; }

    setSaving(true);
    try {
      await onSave({
        trainNumber: trainNumber.trim(),
        direction:   `${from} → ${to}`,
        departureTime: new Date(dep).toISOString(),
        arrivalTime:   new Date(arr).toISOString(),
        station: from,
      });
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

        <div style={headerStyles.row}>
          <div>
            <p style={headerStyles.eyebrow}>
              {train ? 'Редагування' : 'Новий маршрут'}
            </p>
            <h2 style={headerStyles.title}>
              {train ? 'Змінити поїзд' : 'Додати поїзд'}
            </h2>
          </div>
          <button onClick={onClose} aria-label="Закрити" style={headerStyles.closeBtn}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={formStyles.form}>

          <div>
            <span style={lbl}>Номер поїзда</span>
            <input
              className="field-cream"
              value={trainNumber}
              onChange={e => setTrainNumber(e.target.value)}
              placeholder="наприклад: IC 741"
              onFocus={focusField}
              onBlur={blurField}
            />
          </div>

          <div style={formStyles.directionGrid}>
            <div>
              <span style={lbl}>Звідки</span>
              <select className="field-cream" value={from} onChange={e => setFrom(e.target.value)} onFocus={focusField} onBlur={blurField} style={{ cursor: 'pointer' }}>
                {STATIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={formStyles.directionArrow}>→</div>
            <div>
              <span style={lbl}>Куди</span>
              <select className="field-cream" value={to} onChange={e => setTo(e.target.value)} onFocus={focusField} onBlur={blurField} style={{ cursor: 'pointer' }}>
                {STATIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div style={formStyles.timesGrid}>
            <div>
              <span style={lbl}>Відправлення</span>
              <input type="datetime-local" className="field-cream" value={dep} onChange={e => setDep(e.target.value)} onFocus={focusField} onBlur={blurField} />
            </div>
            <div>
              <span style={lbl}>Прибуття</span>
              <input type="datetime-local" className="field-cream" value={arr} onChange={e => setArr(e.target.value)} onFocus={focusField} onBlur={blurField} />
            </div>
          </div>

          {error && (
            <div style={formStyles.errorBox}>
              {error}
            </div>
          )}

          <div style={formStyles.btnRow}>
            <button type="button" onClick={onClose} style={formStyles.cancelBtn}>
              Скасувати
            </button>
            <button type="submit" disabled={saving} style={formStyles.submitBtn(saving)}>
              {saving ? 'Збереження...' : train ? 'Зберегти' : 'Додати поїзд'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
