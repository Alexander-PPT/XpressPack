import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  type?: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
}

export default function Toast({ type = 'info', message, onClose }: ToastProps) {
  const styles = {
    success: 'bg-success/10 border-success/30 text-success',
    error: 'bg-error/10 border-error/30 text-error',
    info: 'bg-ocean/10 border-ocean/30 text-ocean',
  };

  const icons = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <AlertCircle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
  };

  return (
    <div className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${styles[type]}`}>
      <div className="mt-0.5">{icons[type]}</div>
      <p className="text-sm font-medium">{message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar notificacion"
        className="ml-1 opacity-80 hover:opacity-100 transition"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

