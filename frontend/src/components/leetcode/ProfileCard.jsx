import React from 'react';
import { ExternalLink, MapPin, Trophy, TrendingUp, User, Star } from 'lucide-react';
import { 
  formatNumber, 
  getDifficultyColor, 
  getLeetCodeProfileUrl,
  formatRanking 
} from '../../utils/leetcodeHelpers';

const ProfileCard = ({ profile, stats }) => {
  if (!profile) return null;

  const handleViewProfile = () => {
    window.open(getLeetCodeProfileUrl(profile.username), '_blank');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.username}
                className="w-16 h-16 rounded-full border-2 border-gray-200"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center"
              style={{ display: profile.avatar ? 'none' : 'flex' }}
            >
              <User className="w-8 h-8 text-gray-400" />
            </div>
            
            {/* Online status indicator */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{profile.username}</h2>
            {profile.realName && profile.realName !== profile.username && (
              <p className="text-gray-600 font-medium">{profile.realName}</p>
            )}
            
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              {profile.location && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {profile.location}
                </div>
              )}
              
              {profile.ranking && (
                <div className="flex items-center">
                  <Trophy className="w-4 h-4 mr-1" />
                  Rank #{formatRanking(profile.ranking)}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <button
          onClick={handleViewProfile}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <span>View Profile</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">
            {formatNumber(stats?.totalSolved || 0)}
          </div>
          <div className="text-sm text-gray-500">Total Solved</div>
        </div>
        
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {formatNumber(stats?.easy || 0)}
          </div>
          <div className="text-sm text-gray-500">Easy</div>
        </div>
        
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {formatNumber(stats?.medium || 0)}
          </div>
          <div className="text-sm text-gray-500">Medium</div>
        </div>
        
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {formatNumber(stats?.hard || 0)}
          </div>
          <div className="text-sm text-gray-500">Hard</div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">Solve Rate</span>
          <span className="text-gray-500">{stats?.solveRate || 0}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(stats?.solveRate || 0, 100)}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-green-600">Easy</span>
            <span>{stats?.easyRate || 0}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-yellow-600">Medium</span>
            <span>{stats?.mediumRate || 0}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-red-600">Hard</span>
            <span>{stats?.hardRate || 0}%</span>
          </div>
        </div>
      </div>

      {/* Skills Tags */}
      {profile.skillTags && profile.skillTags.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {profile.skillTags.slice(0, 8).map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {skill}
              </span>
            ))}
            {profile.skillTags.length > 8 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{profile.skillTags.length - 8} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            Total Submissions
          </div>
          <span className="font-medium">{formatNumber(stats?.totalSubmissions || 0)}</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard
