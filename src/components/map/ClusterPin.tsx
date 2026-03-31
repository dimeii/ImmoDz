"use client";

interface ClusterPinProps {
  count: number;
}

export default function ClusterPin({ count }: ClusterPinProps) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-sm font-bold text-white shadow-lg">
      {count}
    </div>
  );
}
