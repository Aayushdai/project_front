import React from "react";

const MyProfile = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Cover */}
        <div className="h-40 bg-gradient-to-r from-sky-500 to-blue-600"></div>

        {/* Profile Header */}
        <div className="px-6 -mt-16 flex flex-col sm:flex-row items-center sm:items-end gap-4">
          <img
            src="https://i.pravatar.cc/150?img=12"
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-white object-cover"
          />

          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-gray-900">
              Aayush Sharma
            </h2>
            <p className="text-gray-600">
              Kathmandu, Nepal 🇳🇵
            </p>
          </div>

          <button className="px-5 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700 transition">
            Edit Profile
          </button>
        </div>

        {/* Profile Content */}
        <div className="px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="md:col-span-1 space-y-6">
            <ProfileCard title="About">
              <p className="text-sm text-gray-600">
                Solo traveler who loves mountains, trekking, and meeting new
                people. Looking for travel buddies with similar vibes.
              </p>
            </ProfileCard>

            <ProfileCard title="Basic Info">
              <InfoRow label="Age" value="22" />
              <InfoRow label="Gender" value="Male" />
              <InfoRow label="Travel Style" value="Backpacking" />
              <InfoRow label="Pace" value="Moderate" />
            </ProfileCard>
          </div>

          {/* Right Column */}
          <div className="md:col-span-2 space-y-6">
            <ProfileCard title="Interests & Tags">
              <div className="flex flex-wrap gap-2">
                {[
                  "Mountains",
                  "Trekking",
                  "Budget Travel",
                  "Photography",
                  "Food",
                  "Nature",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </ProfileCard>

            <ProfileCard title="Upcoming Trips">
              <ul className="space-y-3">
                <TripItem
                  place="Pokhara"
                  date="March 2026"
                  status="Looking for companions"
                />
                <TripItem
                  place="Annapurna Base Camp"
                  date="April 2026"
                  status="Confirmed"
                />
              </ul>
            </ProfileCard>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------- Helper Components ---------------- */

const ProfileCard = ({ title, children }) => (
  <div className="bg-gray-50 rounded-xl p-5">
    <h3 className="text-lg font-semibold text-gray-800 mb-3">
      {title}
    </h3>
    {children}
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between text-sm text-gray-600 mb-2">
    <span>{label}</span>
    <span className="font-medium text-gray-800">{value}</span>
  </div>
);

const TripItem = ({ place, date, status }) => (
  <li className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
    <div>
      <p className="font-medium text-gray-800">{place}</p>
      <p className="text-sm text-gray-500">{date}</p>
    </div>
    <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">
      {status}
    </span>
  </li>
);

export default MyProfile;
