interface DescriptionItem {
  label: string;
  value: React.ReactNode;
}

export function DescriptionList({
  items,
  columns = 2,
}: {
  items: DescriptionItem[];
  columns?: 1 | 2 | 3;
}) {
  const cols = columns === 1 ? "sm:grid-cols-1" : columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";
  return (
    <dl className={`grid grid-cols-1 gap-x-6 gap-y-4 ${cols}`}>
      {items.map((item) => (
        <div key={item.label} className="space-y-0.5">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</dt>
          <dd className="text-sm font-medium">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
