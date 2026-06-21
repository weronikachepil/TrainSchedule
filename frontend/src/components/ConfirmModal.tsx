'use client';

interface Props {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ message, onConfirm, onCancel }: Props) {
  return (
    <div
      className="modal-backdrop"
      onClick={e => e.target === e.currentTarget && onCancel()}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-card" style={{ maxWidth: 400, textAlign: 'center' }}>

        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: 'rgba(180,60,60,0.1)',
          border: '1.5px solid rgba(180,60,60,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.4rem', margin: '0 auto 20px',
        }}>
          🗑️
        </div>

        <h2 style={{
          fontFamily: 'var(--font-syne)',
          fontWeight: 700,
          fontSize: '1.4rem',
          color: 'var(--text-d)',
          margin: '0 0 8px',
          letterSpacing: '-0.01em',
        }}>
          Видалити маршрут?
        </h2>

        <p style={{
          color: 'var(--muted-d)',
          fontSize: '0.875rem',
          margin: '0 0 28px',
          fontFamily: 'var(--font-sans)',
          lineHeight: 1.5,
        }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '13px',
              border: '1.5px solid var(--border-d)',
              borderRadius: 12,
              background: 'transparent',
              color: 'var(--muted-d)',
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Скасувати
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '13px',
              border: 'none', borderRadius: 12,
              background: '#8B3030',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontFamily: 'var(--font-sans)',
              transition: 'background 0.18s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#7A2828'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#8B3030'; }}
          >
            Видалити
          </button>
        </div>
      </div>
    </div>
  );
}
