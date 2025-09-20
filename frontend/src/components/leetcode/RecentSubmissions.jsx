import React from 'react';
import { Clock, ExternalLink, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { 
  formatTimeAgo, 
  getStatusColor, 
  getLanguageColor, 
  formatProblemTitle,
  getLeetCodeProblemUrl 
} from '../../utils/leetcodeHelpers';

const RecentSubmissions = ({ submissions = [] }) => {
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'wrong answer':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
    }
  };

  const handleProblemClick = (titleSlug) => {
    if (titleSlug) {
      window.open(getLeetCodeProblemUrl(titleSlug), '_blank');
    }
  };

  if (!submissions || submissions.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Recent Submissions
        </h2>
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">No Recent Submissions</p>
          <p className="text-sm">Submit some problems to see your activity here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Recent Submissions
          </h2>
          <div className="text-sm text-gray-500">
            Last {submissions.length} submissions
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {submissions.map((submission, index) => (
          <div
            key={`${submission.titleSlug}-${submission.timestamp}-${index}`}
            className="p-4 hover:bg-gray-50 transition-colors duration-150"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {/* Problem Title */}
                <div className="flex items-center space-x-2 mb-2">
                  {getStatusIcon(submission.statusDisplay)}
                  <button
                    onClick={() => handleProblemClick(submission.titleSlug)}
                    className="font-medium text-gray-900 hover:text-blue-600 flex items-center group"
                  >
                    <span className="truncate">
                      {formatProblemTitle(submission.title)}
                    </span>
                    <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>

                {/* Status and Language */}
                <div className="flex items-center space-x-3 text-sm">
                  <span className={`font-medium ${getStatusColor(submission.statusDisplay)}`}>
                    {submission.statusDisplay}
                  </span>
                  
                  {submission.lang && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLanguageColor(submission.lang)}`}>
                      {submission.lang}
                    </span>
                  )}
                </div>
              </div>

              {/* Timestamp */}
              <div className="flex items-center text-sm text-gray-500 ml-4">
                <Clock className="w-4 h-4 mr-1" />
                {formatTimeAgo(submission.timestamp)}
              </div>
            </div>

            {/* Problem URL Slug (for debugging/reference) */}
            {submission.titleSlug && (
              <div className="mt-2 text-xs text-gray-400 font-mono">
                /{submission.titleSlug}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* View More Button */}
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <button className="w-full text-center text-sm text-gray-600 hover:text-gray-800 transition-colors">
          View All Submissions on LeetCode
          <ExternalLink className="w-4 h-4 inline-block ml-1" />
        </button>
      </div>
    </div>
  );
};

// Component for individual submission item (can be used separately)
export const SubmissionItem = ({ submission, onClick }) => {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex items-center space-x-3">
        <div className={`w-2 h-2 rounded-full ${
          submission.statusDisplay === 'Accepted' ? 'bg-green-500' : 'bg-red-500'
        }`}></div>
        
        <div>
          <button
            onClick={() => onClick?.(submission)}
            className="font-medium text-gray-900 hover:text-blue-600 text-left"
          >
            {formatProblemTitle(submission.title)}
          </button>
          <div className="text-sm text-gray-500 flex items-center space-x-2">
            <span>{submission.statusDisplay}</span>
            {submission.lang && (
              <>
                <span>•</span>
                <span>{submission.lang}</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="text-sm text-gray-400">
        {formatTimeAgo(submission.timestamp)}
      </div>
    </div>
  );
};

// Quick stats component for submissions
export const SubmissionStats = ({ submissions = [] }) => {
  const accepted = submissions.filter(s => s.statusDisplay === 'Accepted').length;
  const total = submissions.length;
  const acceptanceRate = total > 0 ? Math.round((accepted / total) * 100) : 0;

  const recentLanguages = [...new Set(submissions.slice(0, 5).map(s => s.lang).filter(Boolean))];

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-medium text-gray-900 mb-3">Recent Activity Stats</h4>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-gray-500">Acceptance Rate</div>
          <div className="font-semibold text-green-600">{acceptanceRate}%</div>
          <div className="text-xs text-gray-400">{accepted}/{total} accepted</div>
        </div>
        
        <div>
          <div className="text-gray-500">Recent Languages</div>
          <div className="flex flex-wrap gap-1 mt-1">
            {recentLanguages.slice(0, 3).map((lang, index) => (
              <span 
                key={index}
                className={`px-2 py-1 rounded text-xs ${getLanguageColor(lang)}`}
              >
                {lang}
              </span>
            ))}
            {recentLanguages.length > 3 && (
              <span className="text-xs text-gray-500">
                +{recentLanguages.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentSubmissions;