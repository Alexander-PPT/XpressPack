import type { ReactNode } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string | ReactNode;
  onClose?: () => void;
  dismissible?: boolean;
}

export default function Alert({
  type = 'info',
  title,
  message,
  onClose,
  dismissible = true,
}: AlertProps) {
  const alertClass = `alert alert-${type}`;

  const icons = {
    success: <CheckCircle className="h-5 w-5 flex-shrink-0" />,
    error: <AlertCircle className="h-5 w-5 flex-shrink-0" />,
    warning: <AlertCircle className="h-5 w-5 flex-shrink-0" />,
    info: <Info className="h-5 w-5 flex-shrink-0" />,
  };

  return (
    <div className={alertClass} role="alert">
      <div className="flex gap-3">
        <div className="flex-shrink-0">{icons[type]}</div>
        <div className="flex-1">
          {title && <h3 className="font-semibold">{title}</h3>}
          <p className={title ? 'mt-1 text-sm' : ''}>{message}</p>
        </div>
        {dismissible && (
          <button
            onClick={onClose}
            className="flex-shrink-0 hover:opacity-70 transition"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
