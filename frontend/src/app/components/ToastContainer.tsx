export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

const typeStyles: Record<ToastType, string> = {
  success: 'border-l-4 border-l-green-500',
  error: 'border-l-4 border-l-red-500',
  warning: 'border-l-4 border-l-[#f5b800]',
  info: 'border-l-4 border-l-blue-500',
};

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${typeStyles[toast.type]} bg-[#1e1e1e] border border-[#3d3d3d] rounded-lg px-4 py-3 text-[#e0e0e0] text-sm shadow-lg animate-slide-in flex items-center justify-between gap-3`}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-[#8e8e8e] hover:text-white text-lg leading-none shrink-0"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}
