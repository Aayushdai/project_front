import React from 'react';

const Home = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg rounded-xl p-6 sticky top-5 h-[calc(100vh-2rem)]">
        <div className="mb-6">
          <h3 className="text-gray-800 text-lg font-semibold">Menu Options</h3>
        </div>
        <ul className="space-y-2">
          <li><a href="/" className="flex items-center text-gray-600 hover:text-indigo-600 font-medium">Your Activity</a></li>
          <li><a href="/my-profile" className="flex items-center text-gray-600 hover:text-indigo-600 font-medium">My Profile</a></li>
          <li><a href="#" className="flex items-center text-gray-600 hover:text-indigo-600 font-medium">Manage Branches</a></li>
          <li><a href="/system-overview" className="flex items-center text-gray-600 hover:text-indigo-600 font-medium">System Overview</a></li>
          <li><a href="/user-management" className="flex items-center text-gray-600 hover:text-indigo-600 font-medium">User Management</a></li>
          <li><a href="/financial-report" className="flex items-center text-gray-600 hover:text-indigo-600 font-medium">Financial Reports</a></li>
          <li><a href="/system-setting" className="flex items-center text-gray-600 hover:text-indigo-600 font-medium">System Settings</a></li>
          <li><a href="#" className="flex items-center text-gray-600 hover:text-indigo-600 font-medium">Audit Logs</a></li>
          <li><a href="#" className="flex items-center text-gray-600 hover:text-indigo-600 font-medium">Logout</a></li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center mb-8 p-4 bg-white rounded-xl shadow">
          <div className="w-12 h-12 bg-indigo-500 text-white flex items-center justify-center rounded-lg font-bold mr-4">S</div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Super Admin Dashboard</h1>
            <p className="text-gray-500 text-sm">System wide overview and management</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-500 hover:shadow-lg transition">
            <h3 className="text-sm text-gray-500 uppercase mb-2">Total Branches</h3>
            <div className="text-2xl font-bold text-gray-800">24</div>
            <div className="text-xs text-gray-400">Active Branches</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-green-500 hover:shadow-lg transition">
            <h3 className="text-sm text-gray-500 uppercase mb-2">Total Customers</h3>
            <div className="text-2xl font-bold text-gray-800">1,25,450</div>
            <div className="text-xs text-gray-400">+12% from last month</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-purple-500 hover:shadow-lg transition">
            <h3 className="text-sm text-gray-500 uppercase mb-2">Monthly Revenue</h3>
            <div className="text-2xl font-bold text-gray-800">NPR 2.8Cr</div>
            <div className="text-xs text-gray-400">+8.5% increase</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-yellow-500 hover:shadow-lg transition">
            <h3 className="text-sm text-gray-500 uppercase mb-2">System Uptime</h3>
            <div className="text-2xl font-bold text-gray-800">98.5%</div>
            <div className="text-xs text-gray-400">Last 30 days</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Bar Chart */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Branch Performance</h2>
            <div className="flex items-end h-48 gap-4">
              <div className="flex-1 bg-blue-500 rounded-t-lg h-[90%] relative">
                <div className="absolute bottom-[-1.5rem] left-1/2 transform -translate-x-1/2 text-xs text-gray-500">Kathmandu</div>
              </div>
              <div className="flex-1 bg-blue-500 rounded-t-lg h-[75%] relative">
                <div className="absolute bottom-[-1.5rem] left-1/2 transform -translate-x-1/2 text-xs text-gray-500">Lalitpur</div>
              </div>
              <div className="flex-1 bg-blue-500 rounded-t-lg h-[60%] relative">
                <div className="absolute bottom-[-1.5rem] left-1/2 transform -translate-x-1/2 text-xs text-gray-500">Bhaktapur</div>
              </div>
              <div className="flex-1 bg-blue-500 rounded-t-lg h-[80%] relative">
                <div className="absolute bottom-[-1.5rem] left-1/2 transform -translate-x-1/2 text-xs text-gray-500">Pokhara</div>
              </div>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Status Distribution</h2>
            <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-green-500 via-yellow-500 to-red-500 relative mb-4"></div>
            <div className="flex flex-wrap gap-4 justify-center text-xs text-gray-500">
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500"></div>Paid (60%)</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-500"></div>Pending (10%)</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500"></div>Overdue (10%)</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-400"></div>Other (20%)</div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Branch Efficiency Overview</h2>
          <p className="text-gray-500 text-sm">
            Comprehensive analysis of branch performance metrics including customer satisfaction,
            transaction volumes, and operational efficiency across all locations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
