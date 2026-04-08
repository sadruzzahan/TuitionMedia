"use client";

import dynamic from "next/dynamic";

const ProfileContent = dynamic(() => import("./profile-content"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
    </div>
  ),
});

export default function ProfilePage() {
  return <ProfileContent />;
}
