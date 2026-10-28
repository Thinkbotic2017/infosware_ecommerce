import ProfileDashboard from "../components/Profile/ProfileDashboard";

export default function ProfileLayout({ children }) {

  return (
    <div className="min-h-screen bg-[#f8fafc]">

      <div className="max-w-[1400px] ">

        <div className="flex flex-col lg:flex-row gap-8">

          {/* SIDEBAR */}
          <ProfileDashboard />

          {/* RIGHT CONTENT */}
          <div className="flex-1">
            {children}
          </div>

        </div>

      </div>

    </div>
  );
}