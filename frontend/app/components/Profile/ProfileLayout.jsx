
"use client";

import ProfileDashboard from "./ProfileDashboard";

export default function ProfileLayout({ children }) {
  return (
    <div className="min-h-screen w-full bg-[#f8fafc]">
      <div className="flex min-h-screen w-full">

        {/* PROFILE SIDEBAR */}
        <div className="hidden w-[260px] shrink-0 lg:block">
          <ProfileDashboard />
        </div>

        {/* PAGE CONTENT */}
        <main className="min-w-0 flex-1">
          {children}
        </main>

      </div>
    </div>
  );
}
