// Helper functions for LeetCode feature

// Format timestamp to relative time
export const formatTimeAgo = (timestamp) => {
  const now = Date.now();
  const diff = now - (timestamp * 1000); // LeetCode timestamps are in seconds
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

// Get difficulty color
export const getDifficultyColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return 'text-green-500';
    case 'medium':
      return 'text-yellow-500';
    case 'hard':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
};

// Get difficulty background color
export const getDifficultyBgColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'hard':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Get status color for submissions
export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'accepted':
      return 'text-green-600';
    case 'wrong answer':
      return 'text-red-600';
    case 'time limit exceeded':
      return 'text-orange-600';
    case 'memory limit exceeded':
      return 'text-purple-600';
    case 'runtime error':
      return 'text-pink-600';
    default:
      return 'text-gray-600';
  }
};

// Calculate solve rate
export const calculateSolveRate = (solved, total) => {
  if (!total || total === 0) return 0;
  return Math.round((solved / total) * 100);
};

// Format large numbers
export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Validate username format
export const isValidUsername = (username) => {
  if (!username || username.trim().length === 0) {
    return false;
  }
  
  // LeetCode username rules: 3-15 characters, alphanumeric and underscores
  const usernameRegex = /^[a-zA-Z0-9_]{1,15}$/;
  return usernameRegex.test(username.trim());
};

// Get programming language color
export const getLanguageColor = (lang) => {
  const colors = {
    javascript: 'bg-yellow-100 text-yellow-800',
    python: 'bg-blue-100 text-blue-800',
    java: 'bg-red-100 text-red-800',
    cpp: 'bg-purple-100 text-purple-800',
    'c++': 'bg-purple-100 text-purple-800',
    c: 'bg-gray-100 text-gray-800',
    go: 'bg-cyan-100 text-cyan-800',
    rust: 'bg-orange-100 text-orange-800',
    swift: 'bg-red-100 text-red-800',
    kotlin: 'bg-purple-100 text-purple-800',
    typescript: 'bg-blue-100 text-blue-800',
    ruby: 'bg-red-100 text-red-800',
    php: 'bg-indigo-100 text-indigo-800',
  };
  
  return colors[lang?.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

// Generate chart data for stats
export const generateChartData = (stats) => {
  return [
    {
      name: 'Easy',
      value: stats.easy || 0,
      color: '#10b981', // green-500
    },
    {
      name: 'Medium',
      value: stats.medium || 0,
      color: '#f59e0b', // yellow-500
    },
    {
      name: 'Hard',
      value: stats.hard || 0,
      color: '#ef4444', // red-500
    },
  ];
};

// Calculate contest performance level
export const getContestLevel = (rating) => {
  if (!rating) return { level: 'Unrated', color: 'text-gray-500' };
  
  if (rating < 1400) {
    return { level: 'Pupil', color: 'text-green-500' };
  } else if (rating < 1600) {
    return { level: 'Specialist', color: 'text-cyan-500' };
  } else if (rating < 1900) {
    return { level: 'Expert', color: 'text-blue-500' };
  } else if (rating < 2100) {
    return { level: 'Candidate Master', color: 'text-purple-500' };
  } else if (rating < 2400) {
    return { level: 'Master', color: 'text-orange-500' };
  } else {
    return { level: 'Grandmaster', color: 'text-red-500' };
  }
};

// Format contest ranking
export const formatRanking = (ranking) => {
  if (!ranking) return 'N/A';
  
  if (ranking >= 1000000) {
    return `${Math.floor(ranking / 1000000)}M+`;
  } else if (ranking >= 1000) {
    return `${Math.floor(ranking / 1000)}K+`;
  }
  
  return ranking.toLocaleString();
};

// Clean and format problem title
export const formatProblemTitle = (title) => {
  if (!title) return '';
  
  // Remove extra spaces and capitalize properly
  return title.trim().replace(/\s+/g, ' ');
};

// Generate LeetCode problem URL
export const getLeetCodeProblemUrl = (titleSlug) => {
  return `https://leetcode.com/problems/${titleSlug}/`;
};

// Generate LeetCode profile URL
export const getLeetCodeProfileUrl = (username) => {
  return `https://leetcode.com/${username}/`;
};