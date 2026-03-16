"use client";

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-shimmer rounded-md ${className}`}
      style={{ minHeight: "1em" }}
    />
  );
}
