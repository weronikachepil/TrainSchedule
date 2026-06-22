'use client';

type Props = {
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
      <div className="modal-card max-w-[400px] text-center">

        <div className="w-[52px] h-[52px] rounded-full bg-[rgba(180,60,60,0.1)] border border-[rgba(180,60,60,0.2)] flex items-center justify-center text-[1.4rem] mx-auto mb-5">
          🗑️
        </div>

        <h2 className="font-headline font-bold text-[1.4rem] text-td m-0 mb-2 tracking-[-0.01em]">
          Видалити маршрут?
        </h2>

        <p className="text-md text-[0.875rem] m-0 mb-7 font-sans leading-[1.5]">
          {message}
        </p>

        <div className="flex gap-[10px]">
          <button
            onClick={onCancel}
            className="flex-1 py-[13px] border-15-bd rounded-[12px] bg-transparent text-md font-medium cursor-pointer text-[0.9rem] font-sans"
          >
            Скасувати
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-[13px] border-none rounded-[12px] bg-[#8B3030] text-white font-semibold cursor-pointer text-[0.9rem] font-sans transition-colors duration-200 hover:bg-[#7A2828]"
          >
            Видалити
          </button>
        </div>
      </div>
    </div>
  );
}
