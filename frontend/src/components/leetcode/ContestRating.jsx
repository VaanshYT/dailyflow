import React from 'react';
import { Trophy, TrendingUp, Users, Award, Star, Target } from 'lucide-react';
import { 
  getContestLevel, 
  formatRanking, 
  formatNumber 
} from '../../utils/leetcodeHelpers';

const ContestRating = ({ contestRating, profile }) => {
  if (!contestRating) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Trophy className="w-5 h-5 mr-2" />
          Contest Performance
        </h2>
        <div className="text-center py-8 text-gray-500">
          <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">No Contest Data</p>
          <p className="text-sm">Participate in contests to see your rating here</p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
            Join Next Contest
          </button>
        </div>
      </div>
    );
  }

  const contestLevel = getContestLevel(contestRating.rating);
  const topPercentage = contestRating.topPercentage || 
    (contestRating.globalRanking && contestRating.totalParticipants 
      ? ((contestRating.globalRanking / contestRating.totalParticipants) * 100).toFixed(1)
      : null);

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <Trophy className="w-5 h-5 mr-2" />
          Contest Performance
        </h2>
      </div>

      <div className="p-6">
        {/* Main Rating Display */}
        <div className="text-center mb-6">
          <div className="relative inline-block">
            <div className={`text-4xl font-bold mb-2 ${contestLevel.color}`}>
              {contestRating.rating}
            </div>
            <div className={`text-lg font-medium ${contestLevel.color}`}>
              {contestLevel.level}
            </div>
            
            {/* Badge/Crown for high ratings */}
            {contestRating.rating >= 2100 && (
              <div className="absolute -top-2 -right-2">
                <Star className="w-6 h-6 text-yellow-500 fill-current" />
              </div>
            )}
          </div>
          
          {contestRating.badge?.name && (
            <div className="mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                <Award className="w-4 h-4 mr-1" />
                {contestRating.badge.name}
              </span>
            </div>
          )}
        </div>

        {/* Contest Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {contestRating.attendedContestsCount || 0}
            </div>
            <div className="text-sm text-gray-600">Contests Attended</div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-900">
              {formatRanking(contestRating.globalRanking)}
            </div>
            <div className="text-sm text-gray-600">Global Ranking</div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {topPercentage ? `${topPercentage}%` : 'N/A'}
            </div>
            <div className="text-sm text-gray-600">Top Percentage</div>
          </div>

          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-900">
              {contestLevel.level.split(' ')[0]}
            </div>
            <div className="text-sm text-gray-600">Current Level</div>
          </div>
        </div>

        {/* Rating Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Rating Progress</span>
            <span className="text-sm text-gray-500">{contestRating.rating} points</span>
          </div>
          
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500`}
                style={{ 
                  width: `${Math.min((contestRating.rating / 2400) * 100, 100)}%`,
                  backgroundColor: contestLevel.color.includes('red') ? '#ef4444' :
                                 contestLevel.color.includes('orange') ? '#f97316' :
                                 contestLevel.color.includes('purple') ? '#8b5cf6' :
                                 contestLevel.color.includes('blue') ? '#3b82f6' :
                                 contestLevel.color.includes('cyan') ? '#06b6d4' :
                                 contestLevel.color.includes('green') ? '#10b981' : '#6b7280'
                }}
              ></div>
            </div>
            
            {/* Rating milestones */}
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0</span>
              <span>1400</span>
              <span>1600</span>
              <span>1900</span>
              <span>2100</span>
              <span>2400+</span>
            </div>
          </div>
        </div>

        {/* Next Level Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Next Level Goal</h4>
          {contestRating.rating < 2400 ? (
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">
                  Progress to {getContestLevel(getNextRatingThreshold(contestRating.rating)).level}
                </span>
                <span className="font-medium">
                  {getNextRatingThreshold(contestRating.rating) - contestRating.rating} points needed
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${((contestRating.rating - getPreviousRatingThreshold(contestRating.rating)) / 
                            (getNextRatingThreshold(contestRating.rating) - getPreviousRatingThreshold(contestRating.rating))) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="text-center text-sm text-gray-600">
              <Star className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
              Congratulations! You've reached the highest level!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper functions for rating thresholds
const getNextRatingThreshold = (rating) => {
  if (rating < 1400) return 1400;
  if (rating < 1600) return 1600;
  if (rating < 1900) return 1900;
  if (rating < 2100) return 2100;
  if (rating < 2400) return 2400;
  return 2400;
};

const getPreviousRatingThreshold = (rating) => {
  if (rating < 1400) return 0;
  if (rating < 1600) return 1400;
  if (rating < 1900) return 1600;
  if (rating < 2100) return 1900;
  if (rating < 2400) return 2100;
  return 2100;
};

// Compact version for smaller displays
export const ContestRatingCompact = ({ contestRating }) => {
  if (!contestRating) return null;

  const contestLevel = getContestLevel(contestRating.rating);

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Trophy className="w-5 h-5 text-orange-500" />
          <div>
            <div className={`font-bold ${contestLevel.color}`}>
              {contestRating.rating}
            </div>
            <div className="text-xs text-gray-500">{contestLevel.level}</div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">
            #{formatRanking(contestRating.globalRanking)}
          </div>
          <div className="text-xs text-gray-500">
            {contestRating.attendedContestsCount} contests
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestRating;