const ThriftSkeleton = () => {
  return (
    <div className="flex flex-col bg-bg-vermillion/50 border border-bg-vermillion/30 rounded-xl overflow-hidden shadow-sm animate-pulse">
      {/* Image Skeleton */}
      <div className="relative aspect-4/5 bg-bg-clean/50 shrink-0" />

      {/* Content Skeleton */}
      <div className="p-4 flex flex-col flex-1 space-y-4">
        <div className="h-4 bg-bg-clean/50 rounded-lg w-3/4" />
        
        <div className="bg-bg-fresh/30 h-10 rounded-xl border border-bg-fresh/20" />

        <div className="flex items-center gap-2 mt-auto">
          <div className="w-6 h-6 rounded-full bg-bg-clean/50" />
          <div className="h-3 bg-bg-clean/50 rounded-lg w-1/2" />
        </div>
      </div>
    </div>
  );
};

export default ThriftSkeleton;
