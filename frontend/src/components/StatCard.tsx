interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
}

export default function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="glass-card p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-ink/50">{label}</p>
      <h3 className="font-display text-3xl">{value}</h3>
      {hint ? <p className="text-sm text-ink/60">{hint}</p> : null}
    </div>
  );
}
