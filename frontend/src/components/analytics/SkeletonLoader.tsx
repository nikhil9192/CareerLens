interface SkeletonLoaderProps {
  rows?: number;
  className?: string;
}

export default function SkeletonLoader({
  rows = 4,
  className = "",
}: SkeletonLoaderProps) {
  return (
    <div className={`space-y-3 ${className}`} aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="skeleton-bone h-4 w-full"
          style={{ width: `${100 - i * 8}%` }}
        />
      ))}
    </div>
  );
}
