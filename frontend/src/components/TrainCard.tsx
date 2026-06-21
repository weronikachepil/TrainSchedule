'use client';

import type { Train } from '@/types';

const W = 'https://upload.wikimedia.org/wikipedia/commons';
const CITY_IMAGES: Record<string, string> = {
  'Київ':      `${W}/b/b2/%D0%91%D1%83%D0%B4%D0%B8%D0%BD%D0%BE%D0%BA_%D0%B7_%D1%85%D0%B8%D0%BC%D0%B5%D1%80%D0%B0%D0%BC%D0%B8%2C_%D1%81%D0%B5%D1%80%D0%BF%D0%B5%D0%BD%D1%8C_2019.jpg`,
  'Львів':     `${W}/1/16/%D0%9B%D0%B0%D1%82%D0%B8%D0%BD%D1%81%D1%8C%D0%BA%D0%B8%D0%B9_%D0%BA%D0%B0%D1%84%D0%B5%D0%B4%D1%80%D0%B0%D0%BB%D1%8C%D0%BD%D0%B8%D0%B9_%D1%81%D0%BE%D0%B1%D0%BE%D1%80_%28%D0%9B%D1%8C%D0%B2%D1%96%D0%B2%29_16.jpg`,
  'Одеса':     `${W}/5/5f/%D0%92%D0%BE%D1%80%D0%BE%D0%BD%D1%86%D0%BE%D0%B2%D1%81%D1%8C%D0%BA%D0%B8%D0%B9_%D0%BC%D0%B0%D1%8F%D0%BA_17.jpg`,
  'Харків':    `${W}/e/ea/%D0%A3%D0%BA%D1%80%D0%B0%D1%97%D0%BD%D0%B0%2C_%D0%A5%D0%B0%D1%80%D0%BA%D1%96%D0%B2%2C_%D0%BF%D0%BB._%D0%9A%D0%BE%D0%BD%D1%81%D1%82%D0%B8%D1%82%D1%83%D1%86%D1%96%D1%97%2C_7_%D1%84%D0%BE%D1%82%D0%BE_1.JPG`,
  'Дніпро':    `${W}/7/77/Dnipropetrovsk_view_2015_tov-tob.jpg`,
  'Запоріжжя': `${W}/7/73/%D0%9D%D1%96%D1%87%D0%BD%D0%B8%D0%B9_%D0%BF%D1%80%D0%BE%D1%81%D0%BF%D0%B5%D0%BA%D1%82.jpg`,
  'Вінниця':   `${W}/5/5f/%D0%92%D0%B5%D1%81%D0%B5%D0%BB%D0%BA%D0%B0_%D0%BD%D0%B0%D0%B4_%D0%94%D0%BE%D0%BC%D1%96%D0%BD%D1%96%D0%BA%D0%B0%D0%BD%D1%81%D1%8C%D0%BA%D0%B8%D0%BC_%D0%BC%D0%BE%D0%BD%D0%B0%D1%81%D1%82%D0%B8%D1%80%D0%B5%D0%BC_P1730263_%D0%92%D1%96%D0%BD%D0%BD%D0%B8%D1%86%D1%8F.jpg`,
  'Полтава':   `${W}/d/d6/%D0%91%D1%83%D0%B4%D0%B8%D0%BD%D0%BE%D0%BA_%D0%B7%D0%B5%D0%BC%D1%81%D1%82%D0%B2%D0%B0_P1230868_%D0%BF%D0%BB._%D0%9A%D0%BE%D0%BD%D1%81%D1%82%D0%B8%D1%82%D1%83%D1%86%D1%96%D1%97%2C_2.jpg`,
  'Чернівці':  `${W}/4/4e/%D0%9F%D0%BB.%D0%A6%D0%B5%D0%BD%D1%82%D1%80%D0%B0%D0%BB%D1%8C%D0%BD%D0%B0%2C_10_DSC_8826.jpg`,
  'Ужгород':   `${W}/c/ce/%D0%A3%D0%B6%D0%B3%D0%BE%D1%80%D0%BE%D0%B4%D1%81%D1%8C%D0%BA%D0%B8%D0%B9_%D0%BA%D0%B0%D1%84%D0%B5%D0%B4%D1%80%D0%B0%D0%BB%D1%8C%D0%BD%D0%B8%D0%B9_%D1%81%D0%BE%D0%B1%D0%BE%D1%80%2C_%D0%B0%D0%B5%D1%80%D0%BE%D1%84%D0%BE%D1%82%D0%BE_2.jpg`,
};

const FALLBACK_IMAGE = `${W}/7/77/Dnipropetrovsk_view_2015_tov-tob.jpg`;

const fmtTime = (d: string) =>
  new Date(d).toLocaleString('uk-UA', { hour: '2-digit', minute: '2-digit' });
const fmtDate = (d: string) =>
  new Date(d).toLocaleString('uk-UA', { day: 'numeric', month: 'short' });

function timeOfDay(d: string): string {
  const h = new Date(d).getHours();
  if (h >= 5  && h < 12) return 'Ранок';
  if (h >= 12 && h < 18) return 'День';
  if (h >= 18)           return 'Вечір';
  return 'Ніч';
}

interface Props {
  train: Train;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TrainCard({ train, canEdit, onEdit, onDelete }: Props) {
  const destination = train.direction.split(' → ')[1] ?? train.direction;
  const image = CITY_IMAGES[destination] ?? FALLBACK_IMAGE;
  const tod   = timeOfDay(train.departureTime);

  return (
    <article className="train-card">

      {/* ── Dark image section ── */}
      <div className="card-image">
        <div className="card-image-bg" style={{ backgroundImage: `url(${image})` }} />
        <div className="card-image-overlay">

          {/* Top row: train number + time-of-day badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="badge badge-light">{train.trainNumber}</span>
            <span className="badge badge-light">{tod}</span>
          </div>

          {/* Bottom: direction */}
          <div>
            <p style={{
              fontFamily: 'var(--font-syne)',
              fontWeight: 700,
              fontSize: '1.3rem',
              color: 'var(--cream)',
              margin: 0,
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
            }}>
              {train.direction}
            </p>
          </div>
        </div>
      </div>

      {/* ── Cream info section ── */}
      <div className="card-body">

        {/* Station */}
        <p style={{
          fontSize: '0.76rem',
          color: 'var(--muted-d)',
          margin: '0 0 12px',
          fontWeight: 500,
          letterSpacing: '0.01em',
        }}>
          📍 {train.station}
        </p>

        {/* Time track */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-d)' }}>
              {fmtTime(train.departureTime)}
            </div>
            <div style={{ fontSize: '0.62rem', color: 'var(--muted-d)', fontWeight: 600, letterSpacing: '0.09em', marginTop: 1 }}>
              ВІДПР
            </div>
          </div>

          <div className="time-line" />

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-d)' }}>
              {fmtTime(train.arrivalTime)}
            </div>
            <div style={{ fontSize: '0.62rem', color: 'var(--muted-d)', fontWeight: 600, letterSpacing: '0.09em', marginTop: 1 }}>
              ПРИБУТТЯ
            </div>
          </div>
        </div>

        {/* Bottom row: date + actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="badge badge-dark">{fmtDate(train.departureTime)}</span>

          {canEdit && (
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className="icon-btn"
                onClick={onEdit}
                aria-label="Редагувати"
                title="Редагувати"
              >
                ✏️
              </button>
              <button
                className="icon-btn danger"
                onClick={onDelete}
                aria-label="Видалити"
                title="Видалити"
              >
                🗑️
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
