"use client";

import { AloqaInlineLoader } from "@/components/loaders";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <AloqaInlineLoader size="md" />
        <p className="mt-4 text-lg text-gray-600">Loading your dashboard...</p>
      </div>
    </div>
  );
}