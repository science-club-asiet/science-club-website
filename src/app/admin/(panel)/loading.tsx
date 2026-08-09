export default function AdminPanelLoading() {
  return (
    <div className="max-w-5xl animate-pulse space-y-6">
      {/* Title & subtitle skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 bg-gray-200 rounded-md" />
        <div className="h-4 w-96 bg-gray-100 rounded-md" />
      </div>

      {/* Action bar / quick actions skeleton */}
      <div className="flex gap-2 pt-2">
        <div className="h-8 w-24 bg-gray-200 rounded-full" />
        <div className="h-8 w-24 bg-gray-200 rounded-full" />
        <div className="h-8 w-24 bg-gray-200 rounded-full" />
      </div>

      {/* Grid panels skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="h-4 w-36 bg-gray-200 rounded" />
              <div className="h-4 w-12 bg-gray-100 rounded-full" />
            </div>
            <div className="space-y-3 pt-1">
              <div className="h-4 w-full bg-gray-100 rounded" />
              <div className="h-4 w-3/4 bg-gray-100 rounded" />
              <div className="h-4 w-5/6 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
