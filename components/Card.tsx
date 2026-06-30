export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-soft ${className}`}>{children}</div>;
}

export function KpiCard({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return (
    <Card>
      <div className="text-sm font-medium text-slate-500">{title}</div>
      <div className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{value}</div>
      <div className="mt-2 text-sm text-slate-500">{subtitle}</div>
    </Card>
  );
}
