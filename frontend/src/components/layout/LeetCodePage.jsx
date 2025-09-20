import React, { useState } from 'react';
import { Code2, Search, TrendingUp, Users, Sparkles } from 'lucide-react';
import { useLeetCode } from '../../hooks/useLeetCode';
import LeetCodeSearch from '../leetcode/LeetCodeSearch';
import LeetCodeProfile, { EmptyState } from '../leetcode/LeetCodeProfile';


const LeetCodePage = () => {
  const {
    profile,
    stats,
    recentSubmissions,
    contestRating,
    loading,
    error,
    searchHistory,
    loadUserProfile,
    retryWithMockData,
    getSearchSuggestions,
    clearSearchHistory,
    hasData,
    isEmpty
  } = useLeetCode();

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = async (username) => {
    setSearchQuery(username);
    await loadUserProfile(username);
  };

  const handleRetry = () => {
    if (searchQuery) {
      loadUserProfile(searchQuery);
    }
  };

  const handleRetryWithMock = () => {
    if (searchQuery) {
      retryWithMockData(searchQuery);
    }
  };

  const handleExampleSearch = (username) => {
    handleSearch(username);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Code2 className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    LeetCode Profile Tracker
                  </h1>
                  <p className="text-gray-600">
                    Analyze coding performance and track progress
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              {hasData && (
                <div className="hidden md:flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">
                      {stats?.totalSolved || 0}
                    </div>
                    <div className="text-gray-500">Solved</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">
                      {stats?.solveRate || 0}%
                    </div>
                    <div className="text-gray-500">Success Rate</div>
                  </div>
                  {contestRating && (
                    <div className="text-center">
                      <div className="font-semibold text-orange-600">
                        {contestRating.rating}
                      </div>
                      <div className="text-gray-500">Contest Rating</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <LeetCodeSearch
            onSearch={handleSearch}
            loading={loading}
            searchHistory={searchHistory}
            onClearHistory={clearSearchHistory}
            getSearchSuggestions={getSearchSuggestions}
          />
        </div>

        {/* Content Area */}
        <div className="space-y-8">
          {/* Empty state when no search has been performed */}
          {isEmpty && (
            <EmptyState onExampleSearch={handleExampleSearch} />
          )}

          {/* Profile data or loading/error states */}
          {!isEmpty && (
            <LeetCodeProfile
              profile={profile}
              stats={stats}
              recentSubmissions={recentSubmissions}
              contestRating={contestRating}
              loading={loading}
              error={error}
              onRetry={handleRetry}
              onRetryWithMock={handleRetryWithMock}
            />
          )}
        </div>

        {/* Features Section - Show when no data */}
        {isEmpty && (
          <div className="mt-16 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Powerful LeetCode Analytics
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Get comprehensive insights into coding performance with detailed 
                statistics, progress tracking, and contest analytics.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Progress Tracking</h3>
                <p className="text-sm text-gray-600">
                  Visualize problem-solving progress with interactive charts 
                  and difficulty breakdowns.
                </p>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Recent Activity</h3>
                <p className="text-sm text-gray-600">
                  Track recent submissions, languages used, and solution 
                  success rates in real-time.
                </p>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Contest Performance</h3>
                <p className="text-sm text-gray-600">
                  Monitor contest ratings, global rankings, and competitive 
                  programming achievements.
                </p>
              </div>
            </div>

            {/* Popular Users to Search */}
            <div className="mt-12 p-6 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5 text-yellow-500 mr-2" />
                <h3 className="font-medium text-gray-900">Popular Competitive Programmers</h3>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  { username: 'tourist', name: 'Gennady Korotkevich' },
                  { username: 'jiangly', name: 'Jiangly' },
                  { username: 'neal_wu', name: 'Neal Wu' },
                  { username: 'benq', name: 'Benjamin Qi' },
                  { username: 'SecondThread', name: 'SecondThread' },
                  { username: 'tmwilliamlin168', name: 'William Lin' }
                ].map((user) => (
                  <button
                    key={user.username}
                    onClick={() => handleExampleSearch(user.username)}
                    className="group px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="font-medium text-gray-900 text-sm group-hover:text-blue-600">
                      {user.username}
                    </div>
                    <div className="text-xs text-gray-500 truncate max-w-24">
                      {user.name}
                    </div>
                  </button>
                ))}
              </div>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                Click any username to view their LeetCode profile
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              © 2024 DailyFlow. LeetCode Profile Tracker.
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Powered by LeetCode API</span>
              <span>•</span>
              <a 
                href="https://leetcode.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-gray-700 transition-colors"
              >
                Visit LeetCode
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LeetCodePage;