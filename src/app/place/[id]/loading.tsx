export default function PlaceLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
      <div className="h-64 animate-pulse rounded-2xl bg-surface-muted" />
      <div className="mt-8 space-y-3">
        <div className="h-8 w-2/3 max-w-md animate-pulse rounded-lg bg-surface-muted" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded bg-surface-muted" />
        <div className="h-4 w-5/6 max-w-lg animate-pulse rounded bg-surface-muted" />
      </div>
    </div>
  );
}
