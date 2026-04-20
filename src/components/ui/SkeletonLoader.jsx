export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-surface-border bg-white overflow-hidden">
      <div className="skeleton aspect-square" />
      <div className="p-3 space-y-2">
        <div className="skeleton h-4 w-20 rounded-full" />
        <div className="skeleton h-3 w-32 rounded" />
      </div>
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="rounded-xl border border-surface-border bg-white p-5">
      <div className="skeleton h-8 w-16 rounded mb-2" />
      <div className="skeleton h-4 w-24 rounded" />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="rounded-xl border border-surface-border bg-white p-5">
      <div className="skeleton h-5 w-32 rounded mb-4" />
      <div className="skeleton h-48 w-full rounded" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-surface-border">
      <div className="skeleton w-12 h-12 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-32 rounded" />
        <div className="skeleton h-3 w-48 rounded" />
      </div>
    </div>
  );
}
