import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'error' | 'warning';
  size?: 'sm' | 'md';
}

const variantClasses = {
  default: 'badge',
  primary: 'badge badge-primary',
  success: 'badge badge-success',
  error: 'badge badge-error',
  warning: 'badge bg-warning/10 text-amber-700',
};

const sizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
};

export default function Badge({ children, variant = 'default', size = 'md' }: BadgeProps) {
  return <span className={`${variantClasses[variant]} ${sizeClasses[size]}`}>{children}</span>;
}
