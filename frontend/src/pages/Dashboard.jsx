// import React from 'react';
// import { useAuth } from '../context/AuthContext';
// import DailyTasks from '../components/tasks/DailyTasks';

// const Dashboard = () => {
//   const { user } = useAuth();

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-6xl mx-auto px-6 py-12">
        
//         {/* Your existing welcome section */}
//         <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
//           <h1 className="text-3xl font-bold text-black mb-4">Dashboard</h1>
//           <p className="text-gray-600 mb-8">Welcome to your dashboard, {user?.name}!</p>
          
//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//             <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
//               <h3 className="text-xl font-semibold text-black mb-4">Profile Information</h3>
//               <div className="space-y-2">
//                 <p className="text-gray-700"><span className="font-medium">Name:</span> {user?.name}</p>
//                 <p className="text-gray-700"><span className="font-medium">Email:</span> {user?.email}</p>
//                 <p className="text-gray-700"><span className="font-medium">User ID:</span> {user?.id}</p>
//               </div>
//             </div>
            
//             <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
//               <h3 className="text-xl font-semibold text-black mb-4">Account Status</h3>
//               <div className="space-y-2">
//                 <div className="flex items-center gap-2">
//                   <div className="w-3 h-3 bg-green-500 rounded-full"></div>
//                   <span className="text-gray-700">Active</span>
//                 </div>
//                 <p className="text-gray-600 text-sm">Account created successfully</p>
//               </div>
//             </div>
            
//             <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
//               <h3 className="text-xl font-semibold text-black mb-4">Quick Actions</h3>
//               <div className="space-y-3">
//                 <button className="w-full text-left text-gray-700 hover:text-black transition-colors py-1">
//                   → Edit Profile
//                 </button>
//                 <button className="w-full text-left text-gray-700 hover:text-black transition-colors py-1">
//                   → Change Password
//                 </button>
//                 <button className="w-full text-left text-gray-700 hover:text-black transition-colors py-1">
//                   → Account Settings
//                 </button>
//               </div>
//             </div>
//           </div>

//           <div className="mt-8 bg-gray-50 rounded-xl p-6">
//             <h3 className="text-xl font-semibold text-black mb-4">Recent Activity</h3>
//             <div className="space-y-3">
//               <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
//                 <span className="text-gray-700">Account created</span>
//                 <span className="text-gray-500 text-sm">Just now</span>
//               </div>
//               <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
//                 <span className="text-gray-700">Profile information added</span>
//                 <span className="text-gray-500 text-sm">Just now</span>
//               </div>
//               <div className="flex justify-between items-center py-2">
//                 <span className="text-gray-700">Welcome email sent</span>
//                 <span className="text-gray-500 text-sm">Just now</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* NEW: Daily Tasks Section */}
//         <div className="bg-white rounded-2xl shadow-lg">
//           <DailyTasks />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
import React, { useEffect, useState } from 'react';
import { Target, Calendar } from 'lucide-react';
import DailyTasks from '../components/tasks/DailyTasks';
import HabitTracker from '../components/habits/HabitTracker';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

const Dashboard = () => {
  // Mock weekly data (used if no data from backend)
  const mockTaskHistory = {
    "2025-09-14": { total: 5, completed: 5 },
    "2025-09-15": { total: 4, completed: 4 },
    "2025-09-16": { total: 6, completed: 5 },
    "2025-09-17": { total: 5, completed: 5 },
    "2025-09-18": { total: 7, completed: 7 },
    "2025-09-19": { total: 6, completed: 6 },
  };

  const [taskHistory, setTaskHistory] = useState({});
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [averageCompletion, setAverageCompletion] = useState(0);

  // Live stats from DailyTasks
  const [todayStats, setTodayStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    completionRate: 0,
  });

  // Today's date string
  const todayDate = new Date().toISOString().split('T')[0];

  // Today's tasks summary
  const todayTasks = {
    total: todayStats.totalTasks,
    completed: todayStats.completedTasks
  };
  const todayCompletionRate = todayStats.completionRate;

  // Fetch last 7 days data from backend
  useEffect(() => {
    const fetchTaskHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const today = new Date();
        const start = new Date();
        start.setDate(today.getDate() - 6); // past 7 days
        const startDate = start.toISOString().split('T')[0];
        const endDate = today.toISOString().split('T')[0];

        const res = await fetch(`http://localhost:5000/api/tasks/stats?startDate=${startDate}&endDate=${endDate}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to fetch task history');

        const result = await res.json();

        if (!result.data || result.data.length === 0) {
          setTaskHistory(mockTaskHistory); // fallback to mock data
        } else {
          const history = {};
          result.data.forEach(day => {
            history[day.date] = {
              total: day.totalTasks,
              completed: day.completedTasks
            };
          });
          setTaskHistory(history);
        }
      } catch (error) {
        console.error('Error fetching task history:', error);
        setTaskHistory(mockTaskHistory); // fallback on error
      }
    };

    fetchTaskHistory();
  }, []);

  // Calculate streaks and averages whenever taskHistory changes
  useEffect(() => {
    const dates = Object.keys(taskHistory).sort();
    let best = 0, streak = 0;

    // Best streak
    dates.forEach(date => {
      const { total, completed } = taskHistory[date];
      if (total > 0 && total === completed) {
        streak += 1;
        if (streak > best) best = streak;
      } else {
        streak = 0;
      }
    });

    // Current streak (consecutive 100% days ending yesterday)
    streak = 0;
    for (let i = dates.length - 2; i >= 0; i--) {
      const { total, completed } = taskHistory[dates[i]];
      if (total > 0 && total === completed) streak += 1;
      else break;
    }

    setCurrentStreak(streak);
    setBestStreak(best);

    // Average completion last 7 days
    const last7 = dates.slice(-7);
    let sum = 0, count = 0;
    last7.forEach(date => {
      const { total, completed } = taskHistory[date];
      if (total > 0) {
        sum += (completed / total) * 100;
        count += 1;
      }
    });
    setAverageCompletion(count > 0 ? Math.round(sum / count) : 0);
  }, [taskHistory]);

  // Prepare chart data
  const chartData = Object.keys(taskHistory).map(date => {
    const { total, completed } = taskHistory[date];
    return {
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      Completed: completed,
      Pending: total - completed
    };
  });

  // Motivational message
  const motivationalMsg = todayCompletionRate === 100
    ? "🔥 Great job! All tasks completed today!"
    : `⚡ Keep going! Only ${todayTasks.total - todayTasks.completed} task${todayTasks.total - todayTasks.completed !== 1 ? 's' : ''} left today.`;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Target className="text-orange-600" size={32} />
            Dashboard
          </h1>
          <div className="text-gray-500 flex items-center gap-2 mt-2 md:mt-0">
            <Calendar size={16} />
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
        <p className="text-gray-700">{motivationalMsg}</p>
      </div>

      {/* Performance Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 flex flex-col justify-between">
          <p className="text-orange-600 font-medium">Today's Completion</p>
          <p className="text-3xl font-bold text-orange-800">{todayCompletionRate}%</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg mt-8">
          <HabitTracker />
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200 flex flex-col justify-between">
          <p className="text-green-600 font-medium">Current Streak</p>
          <p className="text-3xl font-bold text-green-800">{currentStreak} day{currentStreak !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 flex flex-col justify-between">
          <p className="text-blue-600 font-medium">Best Streak</p>
          <p className="text-3xl font-bold text-blue-800">{bestStreak} day{bestStreak !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 flex flex-col justify-between">
          <p className="text-purple-600 font-medium">7-Day Avg Completion</p>
          <p className="text-3xl font-bold text-purple-800">{averageCompletion}%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow border">
          <h3 className="text-lg font-semibold mb-4">Weekly Task Summary</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Completed" fill="#10B981" />
              <Bar dataKey="Pending" fill="#FBBF24" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border">
          <h3 className="text-lg font-semibold mb-4">Completion Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="Completed" stroke="#10B981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DailyTasks Component */}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <DailyTasks onStatsUpdate={setTodayStats} />
      </div>
    </div>
    
  );
};

export default Dashboard;
