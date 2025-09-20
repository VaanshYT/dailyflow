//const BASE_URL = 'https://alfa-leetcode-api.onrender.com';

// export const fetchUserProfile = async (username) => {
//   try {
//     const response = await fetch(`${BASE_URL}/${username}`);
//     if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
//     const data = await response.json();
    
//    return {
//     username: data.username,
//     realName: data.realName,
//     avatar: data.avatar,
//     location: data.location,
//     ranking: data.ranking,
//     skillTags: data.skillTags || [],
//     stats: {
//       totalSolved: data.solvedCount || 0,
//       easy: data.solvedEasy || 0,
//       medium: data.solvedMedium || 0,
//       hard: data.solvedHard || 0,
//       totalSubmissions: data.totalSubmissions || 0, // May not be provided by API, check docs
//   }
// };
//   } catch (error) {
//     console.error('Failed to fetch user profile:', error);
//     throw error;
//   }
// };
// export const fetchUserProfile = async (username) => {
//   try {
//     const response = await fetch(`${BASE_URL}/userProfile/${username}`);
//     if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

//     const data = await response.json();
//     console.log('User full profile data:', data);

//     return {
//       username: data.username,
//       realName: data.name || username,
//       avatar: data.avatar,
//       location: data.country || '',
//       ranking: data.ranking || 0,
//       skillTags: data.skillTags || [],
//       stats: {
//         totalSolved: data.solvedCount || 0,
//         easy: data.solvedEasy || 0,
//         medium: data.solvedMedium || 0,
//         hard: data.solvedHard || 0,
//         totalSubmissions: data.totalSubmissions || 0,
//       },
//       badges: data.badges || [],
//       contest: data.contest || {},
//       recentSubmissions: data.submissions || [],
//     };
//   } catch (error) {
//     console.error('Failed to fetch full user profile:', error);
//     throw error;
//   }
// };

// export const fetchRecentSubmissions = async (username) => {
//   try {
//     const response = await fetch(`${BASE_URL}/${username}/submission?limit=20`);
//     if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
//     const data = await response.json();
//     return data.submissions || [];
//   } catch (error) {
//     console.error('Failed to fetch recent submissions:', error);
//     return [];
//   }
// };

// export const fetchContestRating = async (username) => {
//   try {
//     const response = await fetch(`${BASE_URL}/${username}/contest`);
//     if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
//     const data = await response.json();
//     return data || null;
//   } catch (error) {
//     console.error('Failed to fetch contest rating:', error);
//     return null;
//   }
// };

const BASE_URL = 'https://alfa-leetcode-api.onrender.com';

export const fetchUserProfile = async (username) => {
  const resp = await fetch(`${BASE_URL}/${username}`);
  if (!resp.ok) throw new Error(`Failed to fetch profile: ${resp.status}`);
  return await resp.json();
};

export const fetchUserSolvedCounts = async (username) => {
  const resp = await fetch(`${BASE_URL}/${username}/solved`);
  if (!resp.ok) throw new Error(`Failed to fetch solved counts: ${resp.status}`);
  return await resp.json();
};

export const fetchUserBadges = async (username) => {
  const resp = await fetch(`${BASE_URL}/${username}/badges`);
  if (!resp.ok) throw new Error(`Failed to fetch badges: ${resp.status}`);
  return await resp.json();
};

export const fetchUserContestDetails = async (username) => {
  const resp = await fetch(`${BASE_URL}/${username}/contest`);
  if (!resp.ok) throw new Error(`Failed to fetch contest info: ${resp.status}`);
  return await resp.json();
};

export const fetchUserRecentSubmissions = async (username, limit = 20) => {
  const resp = await fetch(`${BASE_URL}/${username}/submission?limit=${limit}`);
  if (!resp.ok) throw new Error(`Failed to fetch recent submissions: ${resp.status}`);
  return await resp.json();
};

export const fetchContestRating = async (username) => {
  const resp = await fetch(`${BASE_URL}/userContestRankingInfo/${username}`);
  if (!resp.ok) throw new Error(`Failed to fetch contest rating: ${resp.status}`);
  return await resp.json();
};

