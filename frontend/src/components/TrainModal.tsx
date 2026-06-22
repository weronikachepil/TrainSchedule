'use client';

import { useState, useEffect } from 'react';
import type { Train, TrainData } from '@/types';
import { STATIONS } from '@/types';

type Props = {
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

const focusField = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.target.style.borderColor = 'var(--rose)';
  e.target.style.background  = 'rgba(255,255,255,0.7)';
};
const blurField = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.target.style.borderColor = 'var(--border-d)';
  e.target.style.background  = 'rgba(26,21,17,0.04)';
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
    if (!trainNumber.trim())            { setError('Введіть номер поїзда'); return; }
    if (from === to)                    { setError('Станції мають різнитись'); return; }
    if (!dep)                           { setError('Оберіть час відправлення'); return; }
    if (!arr)                           { setError('Оберіть час прибуття'); return; }
    if (new Date(dep) >= new Date(arr)) { setError('Прибуття має бути пізніше відправлення'); return; }

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

        <div className="flex justify-between items-start mb-7">
          <div>
            <p className="text-[0.7rem] font-semibold text-accent tracking-[0.1em] uppercase m-0 mb-[3px] font-sans">
              {train ? 'Редагування' : 'Новий маршрут'}
            </p>
            <h2 className="font-headline font-bold text-[1.8rem] text-td m-0 tracking-[-0.01em]">
              {train ? 'Змінити поїзд' : 'Додати поїзд'}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Закрити"
            className="w-9 h-9 rounded-full border-15-bd bg-transparent cursor-pointer text-[1.1rem] leading-none text-md flex items-center justify-center shrink-0"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-[15px]">

          <div>
            <span className="block text-[0.7rem] font-semibold text-md tracking-[0.1em] uppercase mb-[6px] font-sans">
              Номер поїзда
            </span>
            <input
              className="field-cream"
              value={trainNumber}
              onChange={e => setTrainNumber(e.target.value)}
              placeholder="наприклад: IC 741"
              onFocus={focusField}
              onBlur={blurField}
            />
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] gap-[10px] items-end">
            <div>
              <span className="block text-[0.7rem] font-semibold text-md tracking-[0.1em] uppercase mb-[6px] font-sans">
                Звідки
              </span>
              <select className="field-cream cursor-pointer" value={from} onChange={e => setFrom(e.target.value)} onFocus={focusField} onBlur={blurField}>
                {STATIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="pb-[2px] text-accent font-bold text-base text-center">→</div>
            <div>
              <span className="block text-[0.7rem] font-semibold text-md tracking-[0.1em] uppercase mb-[6px] font-sans">
                Куди
              </span>
              <select className="field-cream cursor-pointer" value={to} onChange={e => setTo(e.target.value)} onFocus={focusField} onBlur={blurField}>
                {STATIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="block text-[0.7rem] font-semibold text-md tracking-[0.1em] uppercase mb-[6px] font-sans">
                Відправлення
              </span>
              <input type="datetime-local" className="field-cream" value={dep} onChange={e => setDep(e.target.value)} onFocus={focusField} onBlur={blurField} />
            </div>
            <div>
              <span className="block text-[0.7rem] font-semibold text-md tracking-[0.1em] uppercase mb-[6px] font-sans">
                Прибуття
              </span>
              <input type="datetime-local" className="field-cream" value={arr} onChange={e => setArr(e.target.value)} onFocus={focusField} onBlur={blurField} />
            </div>
          </div>

          {error && (
            <div className="bg-[rgba(180,60,60,0.08)] border border-[rgba(180,60,60,0.2)] rounded-[10px] px-[14px] py-[10px] text-[#8B3030] text-[0.875rem]">
              {error}
            </div>
          )}

          <div className="flex gap-[10px] mt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-[13px] border-15-bd rounded-[12px] bg-transparent text-md font-medium cursor-pointer text-[0.9rem] font-sans"
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`flex-[2] py-[13px] border-none rounded-[12px] text-cream font-semibold text-[0.9rem] font-sans transition-colors duration-200 ${saving ? 'bg-[rgba(26,21,17,0.35)] cursor-not-allowed' : 'bg-dark cursor-pointer'}`}
            >
              {saving ? 'Збереження...' : train ? 'Зберегти' : 'Додати поїзд'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
