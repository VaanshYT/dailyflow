// import { useState, useCallback } from 'react';
// import { 
//   fetchUserProfile, 
//   fetchRecentSubmissions, 
//   fetchContestRating 
// } from '../services/leetcodeApi';

// export const useLeetCode = () => {
//   const [profile, setProfile] = useState(null);
//   const [recentSubmissions, setRecentSubmissions] = useState([]);
//   const [contestRating, setContestRating] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [searchHistory, setSearchHistory] = useState([]);

//   const loadUserProfile = useCallback(async (username) => {
//     if (!username || username.trim().length === 0) {
//       setError('Please enter a valid username');
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const userData = await fetchUserProfile(username);
//       setProfile(userData);

//       const [submissions, contest] = await Promise.allSettled([
//         fetchRecentSubmissions(username),
//         fetchContestRating(username),
//       ]);

//       setRecentSubmissions(submissions.status === 'fulfilled' ? submissions.value : []);
//       setContestRating(contest.status === 'fulfilled' ? contest.value : null);

//       // Manage search history
//       setSearchHistory(prev => {
//         const filtered = prev.filter(item => item.username !== username);
//         return [
//           { username, realName: userData.realName, avatar: userData.avatar, timestamp: Date.now() },
//           ...filtered
//         ].slice(0, 5);
//       });

//     } catch (err) {
//       setError(err.message || 'Failed to load user profile');
//       setProfile(null);
//       setRecentSubmissions([]);
//       setContestRating(null);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const clearProfile = useCallback(() => {
//     setProfile(null);
//     setRecentSubmissions([]);
//     setContestRating(null);
//     setError(null);
//   }, []);

//   const getSearchSuggestions = useCallback((query) => {
//     if (!query || query.length < 2) return [];
//     return searchHistory
//       .filter(item =>
//         item.username.toLowerCase().includes(query.toLowerCase()) ||
//         item.realName.toLowerCase().includes(query.toLowerCase())
//       )
//       .slice(0, 3);
//   }, [searchHistory]);

//   const clearSearchHistory = useCallback(() => {
//     setSearchHistory([]);
//   }, []);

//   const stats = profile ? {
//     ...profile.stats,
//     solveRate: profile.stats.totalSubmissions > 0
//       ? Math.round((profile.stats.totalSolved / profile.stats.totalSubmissions) * 100)
//       : 0,
//     easyRate: profile.stats.easy > 0 ? (profile.stats.easy / profile.stats.totalSolved * 100).toFixed(1) : 0,
//     mediumRate: profile.stats.medium > 0 ? (profile.stats.medium / profile.stats.totalSolved * 100).toFixed(1) : 0,
//     hardRate: profile.stats.hard > 0 ? (profile.stats.hard / profile.stats.totalSolved * 100).toFixed(1) : 0,
//   } : null;

//   return {
//     profile,
//     recentSubmissions,
//     contestRating,
//     stats,
//     searchHistory,
//     loading,
//     error,
//     loadUserProfile,
//     clearProfile,
//     getSearchSuggestions,
//     clearSearchHistory,
//     hasData: !!profile,
//     isEmpty: !profile && !loading && !error,
//   };
// };

import { useState, useCallback } from 'react';
import {
  fetchUserProfile,
  fetchUserSolvedCounts,
  fetchUserBadges,
  fetchUserContestDetails,
  fetchUserRecentSubmissions,
  fetchContestRating,
} from '../services/leetcodeApi';

export const useLeetCode = () => {
  const [profile, setProfile] = useState(null);
  const [solvedCounts, setSolvedCounts] = useState(null);
  const [badges, setBadges] = useState([]);
  const [contest, setContest] = useState(null);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [contestRating, setContestRating] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);

  const loadUserProfile = useCallback(async (username) => {
    if (!username || username.trim().length === 0) {
      setError('Please enter a valid username');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [
        userProfile,
        solvedData,
        badgesData,
        contestData,
        submissionsData,
        contestRatingData,
      ] = await Promise.all([
        fetchUserProfile(username),
        fetchUserSolvedCounts(username),
        fetchUserBadges(username),
        fetchUserContestDetails(username),
        fetchUserRecentSubmissions(username),
        fetchContestRating(username),
      ]);

      setProfile(userProfile);
      setSolvedCounts(solvedData);
      setBadges(badgesData);
      setContest(contestData);
      setRecentSubmissions(submissionsData.submissions || []);
      setContestRating(contestRatingData);

      setSearchHistory(prev => {
        const filtered = prev.filter(item => item.username !== username);
        return [
          {
            username,
            realName: userProfile.realName,
            avatar: userProfile.avatar,
            timestamp: Date.now(),
          },
          ...filtered,
        ].slice(0, 5);
      });
    } catch (err) {
      setError(err.message || 'Failed to load user profile');
      setProfile(null);
      setSolvedCounts(null);
      setBadges([]);
      setContest(null);
      setRecentSubmissions([]);
      setContestRating(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearProfile = useCallback(() => {
    setProfile(null);
    setSolvedCounts(null);
    setBadges([]);
    setContest(null);
    setRecentSubmissions([]);
    setContestRating(null);
    setError(null);
  }, []);

  const getSearchSuggestions = useCallback((query) => {
    if (!query || query.length < 2) return [];
    return searchHistory
      .filter(item =>
        item.username.toLowerCase().includes(query.toLowerCase()) ||
        item.realName?.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 3);
  }, [searchHistory]);

  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  const stats = solvedCounts ? {
    totalSolved: solvedCounts.totalSolved || 0,
    easy: solvedCounts.easy || 0,
    medium: solvedCounts.medium || 0,
    hard: solvedCounts.hard || 0,
    totalSubmissions: solvedCounts.totalSubmissions || 0,
    solveRate: solvedCounts.totalSubmissions > 0
      ? Math.round((solvedCounts.totalSolved / solvedCounts.totalSubmissions) * 100)
      : 0,
    easyRate: solvedCounts.easy > 0 ? ((solvedCounts.easy / solvedCounts.totalSolved) * 100).toFixed(1) : 0,
    mediumRate: solvedCounts.medium > 0 ? ((solvedCounts.medium / solvedCounts.totalSolved) * 100).toFixed(1) : 0,
    hardRate: solvedCounts.hard > 0 ? ((solvedCounts.hard / solvedCounts.totalSolved) * 100).toFixed(1) : 0,
  } : null;

  return {
    profile,
    badges,
    contest,
    recentSubmissions,
    contestRating,
    stats,
    searchHistory,
    loading,
    error,
    loadUserProfile,
    clearProfile,
    getSearchSuggestions,
    clearSearchHistory,
    hasData: !!profile,
    isEmpty: !profile && !loading && !error,
  };
};
