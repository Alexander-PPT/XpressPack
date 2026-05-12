import { ReactNode } from 'react';
import { Package, Truck, CheckCircle, TrendingUp } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

const defaultIcons: Record<string, ReactNode> = {
  'Recibidos': <Package className="h-6 w-6" />,
  'En viaje': <Truck className="h-6 w-6" />,
  'Entregados': <CheckCircle className="h-6 w-6" />,
};

export default function StatCard({ label, value, hint, icon, trend }: StatCardProps) {
  const displayIcon = icon || defaultIcons[label];

  return (
    <div className="glass-card p-6 space-y-4 hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink/50">{label}</p>
          <h3 className="font-display text-4xl font-bold mt-2">{value}</h3>
          {hint && <p className="text-sm text-ink/60 mt-1">{hint}</p>}
        </div>
        <div className="text-pine/30">{displayIcon}</div>
      </div>
      {trend && (
        <div className="flex items-center gap-2 text-xs">
          <TrendingUp className={`h-4 w-4 ${trend === 'up' ? 'text-success' : trend === 'down' ? 'text-error' : 'text-ink/40'}`} />
          <span className={`font-semibold ${trend === 'up' ? 'text-success' : trend === 'down' ? 'text-error' : 'text-ink/50'}`}>
            {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}Última 24h
          </span>
        </div>
      )}
    </div>
  );
}
