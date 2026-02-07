import React from "react";

const JobSkeleton = () => {
  return (
    <div className="border p-3 sm:p-6 shadow rounded animate-pulse">
      {/* Company Logo Skeleton */}
      <div className="flex justify-between items-center mb-4">
        <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-300 rounded"></div>
      </div>

      {/* Title Skeleton */}
      <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>

      {/* Location & Level Skeleton */}
      <div className="flex gap-2 sm:gap-3 mb-4">
        <div className="h-6 bg-gray-300 rounded w-24"></div>
        <div className="h-6 bg-gray-300 rounded w-20"></div>
      </div>

      {/* Description Skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-300 rounded w-full"></div>
        <div className="h-4 bg-gray-300 rounded w-5/6"></div>
        <div className="h-4 bg-gray-300 rounded w-4/6"></div>
      </div>

      {/* Skills Skeleton */}
      <div className="mb-4">
        <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
        <div className="flex gap-2">
          <div className="h-6 bg-gray-300 rounded w-16"></div>
          <div className="h-6 bg-gray-300 rounded w-20"></div>
          <div className="h-6 bg-gray-300 rounded w-16"></div>
        </div>
      </div>

      {/* Button Skeleton */}
      <div className="flex gap-4">
        <div className="h-10 bg-gray-300 rounded w-24"></div>
        <div className="h-10 bg-gray-300 rounded w-24"></div>
      </div>
    </div>
  );
};

export default JobSkeleton;
