"use client";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  variant = "primary"
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-background/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-brand-surface rounded-[32px] shadow-premium border border-brand-primary/10 overflow-hidden animate-in zoom-in duration-300">
        <div className="p-8">
          <div className="flex flex-col items-center text-center">
            {variant === "danger" ? (
              <div className="w-16 h-16 bg-brand-error/10 rounded-full flex items-center justify-center text-brand-error mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            ) : (
              <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}

            <h2 className="text-2xl font-black text-brand-text-main tracking-tight mb-3">
              {title}
            </h2>
            <p className="text-sm text-brand-text-body/60 leading-relaxed font-medium mb-8">
              {message}
            </p>

            <div className="w-full flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-4 bg-brand-background text-brand-text-main font-bold rounded-2xl hover:bg-brand-primary/5 transition-all border border-brand-primary/5"
              >
                {cancelLabel}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 px-6 py-4 font-bold rounded-2xl transition-all shadow-sm active:scale-95 ${
                  variant === "danger"
                    ? "bg-brand-error text-white hover:bg-brand-error/90"
                    : "bg-brand-primary text-brand-background hover:bg-brand-primary/90"
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
