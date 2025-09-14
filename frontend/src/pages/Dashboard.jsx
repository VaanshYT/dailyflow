import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-black mb-4">Dashboard</h1>
          <p className="text-gray-600 mb-8">Welcome to your dashboard, {user?.name}!</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
              <h3 className="text-xl font-semibold text-black mb-4">Profile Information</h3>
              <div className="space-y-2">
                <p className="text-gray-700"><span className="font-medium">Name:</span> {user?.name}</p>
                <p className="text-gray-700"><span className="font-medium">Email:</span> {user?.email}</p>
                <p className="text-gray-700"><span className="font-medium">User ID:</span> {user?.id}</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <h3 className="text-xl font-semibold text-black mb-4">Account Status</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Active</span>
                </div>
                <p className="text-gray-600 text-sm">Account created successfully</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
              <h3 className="text-xl font-semibold text-black mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left text-gray-700 hover:text-black transition-colors py-1">
                  → Edit Profile
                </button>
                <button className="w-full text-left text-gray-700 hover:text-black transition-colors py-1">
                  → Change Password
                </button>
                <button className="w-full text-left text-gray-700 hover:text-black transition-colors py-1">
                  → Account Settings
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-black mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                <span className="text-gray-700">Account created</span>
                <span className="text-gray-500 text-sm">Just now</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                <span className="text-gray-700">Profile information added</span>
                <span className="text-gray-500 text-sm">Just now</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-700">Welcome email sent</span>
                <span className="text-gray-500 text-sm">Just now</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;