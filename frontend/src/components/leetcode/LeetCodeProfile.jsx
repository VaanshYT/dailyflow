import React from 'react';
import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import ProfileCard from './ProfileCard';
import StatsChart from './StatsChart';
import RecentSubmissions from './RecentSubmissions';
import ContestRating from './ContestRating';

const LeetCodeProfile = ({ 
  profile, 
  stats, 
  recentSubmissions, 
  contestRating, 
  loading, 
  error, 
  onRetry,
  onRetryWithMock 
}) => {
  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="inline-flex items-center space-x-3 text-blue-600">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-lg font-medium">Loading LeetCode profile...</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Fetching user data from LeetCode API
          </p>
        </div>
        
        {/* Loading skeleton */}
        <div className="space-y-6">
          <div className="bg-gray-200 animate-pulse rounded-xl h-48"></div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-gray-200 animate-pulse rounded-lg h-64"></div>
            <div className="bg-gray-200 animate-pulse rounded-lg h-64"></div>
          </div>
          <div className="bg-gray-200 animate-pulse rounded-lg h-32"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 border border-red-200">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to Load Profile
          </h3>
          
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {error}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onRetry}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
            
            <button
              onClick={onRetryWithMock}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <WifiOff className="w-4 h-4 mr-2" />
              Use Demo Data
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left max-w-lg mx-auto">
            <h4 className="font-medium text-gray-900 mb-2">Common Issues:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Username not found on LeetCode</li>
              <li>• LeetCode API is temporarily unavailable</li>
              <li>• Network connectivity issues</li>
              <li>• CORS restrictions in browser</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!profile) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-gray-500 mb-4">
          <Wifi className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">No Profile Data</p>
          <p className="text-sm">Search for a LeetCode username to get started</p>
        </div>
      </div>
    );
  }

  // Success state - render profile data
  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <ProfileCard profile={profile} stats={stats} />

      {/* Two Column Layout for Charts and Submissions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Stats Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <StatsChart stats={stats} profile={profile} />
        </div>

        {/* Contest Rating - Takes 1 column */}
        <div className="lg:col-span-1">
          <ContestRating contestRating={contestRating} profile={profile} />
        </div>
      </div>

      {/* Recent Submissions - Full width */}
      <RecentSubmissions submissions={recentSubmissions} />
      
      {/* Data freshness indicator */}
      <div className="text-center text-sm text-gray-500 py-4">
        <div className="flex items-center justify-center space-x-2">
          <Wifi className="w-4 h-4 text-green-500" />
          <span>Data fetched from LeetCode API</span>
          <span>•</span>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

// Component for when user hasn't searched yet
export const EmptyState = ({ onExampleSearch }) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wifi className="w-8 h-8 text-blue-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Discover LeetCode Profiles
        </h2>
        
        <p className="text-gray-600 mb-6">
          Enter a LeetCode username to view detailed statistics, recent submissions, 
          contest ratings, and problem-solving progress.
        </p>

        <div className="space-y-3">
          <p className="text-sm text-gray-500 font-medium">Try these examples:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {['neal_wu', 'tourist', 'jiangly', 'benq'].map((username) => (
              <button
                key={username}
                onClick={() => onExampleSearch?.(username)}
                className="px-3 py-1 bg-white text-blue-600 rounded-full text-sm hover:bg-blue-50 transition-colors border border-blue-200"
              >
                {username}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 p-4 bg-white rounded-lg border border-blue-200">
          <h3 className="font-medium text-gray-900 mb-2">Features included:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            <div>✓ Problem solving stats</div>
            <div>✓ Contest performance</div>
            <div>✓ Recent submissions</div>
            <div>✓ Progress visualization</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mini profile card for quick display
export const ProfileMini = ({ profile, stats }) => {
  if (!profile) return null;

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center space-x-4">
      <img
        src={profile.avatar || '/default-avatar.png'}
        alt={profile.username}
        className="w-12 h-12 rounded-full"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">{profile.username}</h3>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>Total: {stats?.totalSolved || 0}</span>
          <span className="text-green-600">Easy: {stats?.easy || 0}</span>
          <span className="text-yellow-600">Medium: {stats?.medium || 0}</span>
          <span className="text-red-600">Hard: {stats?.hard || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default LeetCodeProfile;