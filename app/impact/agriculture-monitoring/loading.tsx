'use client';

export default function Loading() {
  return (
    <div className="min-h-screen bg-space-black">
      {/* Header */}
      <div className="bg-gradient-to-b from-space-gray-900 to-space-black border-b border-space-gray-700">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="h-12 w-96 bg-space-gray-800 animate-pulse rounded-lg mb-4"></div>
          <div className="h-6 w-full max-w-2xl bg-space-gray-800 animate-pulse rounded-lg"></div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-space-gray-900 border border-space-gray-700 rounded-xl p-6"
            >
              <div className="h-5 w-24 bg-space-gray-800 animate-pulse rounded mb-3"></div>
              <div className="h-8 w-32 bg-space-gray-800 animate-pulse rounded"></div>
            </div>
          ))}
        </div>

        {/* Cache Age Skeleton */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="h-4 w-48 bg-space-gray-800 animate-pulse rounded"></div>
        </div>

        {/* Search Bar Skeleton */}
        <div className="bg-space-gray-900 border border-space-gray-700 rounded-xl p-6 mb-8">
          <div className="h-10 bg-space-gray-800 animate-pulse rounded-lg"></div>
        </div>

        {/* Map Skeleton */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-space-gray-900 border border-space-gray-700 rounded-xl overflow-hidden">
              <div className="h-[600px] bg-space-gray-800 animate-pulse flex items-center justify-center">
                <div className="text-space-gray-600 text-lg">Loading map...</div>
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-4">
            <div className="bg-space-gray-900 border border-space-gray-700 rounded-xl p-6">
              <div className="h-10 bg-space-gray-800 animate-pulse rounded-lg mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-20 bg-space-gray-800 animate-pulse rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
