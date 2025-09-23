import React, { useState, useEffect } from 'react';
import { 
  Plus, Target, Calendar, Flame, Trophy, TrendingUp, 
  CheckCircle2, Circle, Edit3, Trash2, Clock, Zap,
  BookOpen, Dumbbell, Heart, Brain, Users, Palette,
  Settings, BarChart3, X, Check
} from 'lucide-react';

const HabitTracker = () => {
  const [habits, setHabits] = useState([]);
  const [dailyHabits, setDailyHabits] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [selectedTab, setSelectedTab] = useState('today'); // today, habits, stats
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalHabits: 0,
    activeStreaks: 0,
    longestStreak: 0,
    totalCompletions: 0
  });

  // Form state for creating/editing habits
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    color: '#3B82F6',
    icon: 'target',
    schedule: {
      type: 'daily',
      days: []
    },
    target: {
      value: '',
      unit: ''
    }
  });

  // Category options with icons and colors
  const categories = [
    { id: 'health', name: 'Health', icon: Heart, color: '#EF4444' },
    { id: 'fitness', name: 'Fitness', icon: Dumbbell, color: '#10B981' },
    { id: 'learning', name: 'Learning', icon: BookOpen, color: '#3B82F6' },
    { id: 'productivity', name: 'Productivity', icon: Zap, color: '#F59E0B' },
    { id: 'mindfulness', name: 'Mindfulness', icon: Brain, color: '#8B5CF6' },
    { id: 'social', name: 'Social', icon: Users, color: '#EC4899' },
    { id: 'creative', name: 'Creative', icon: Palette, color: '#F97316' },
    { id: 'other', name: 'Other', icon: Target, color: '#6B7280' }
  ];

  // Days of week for weekly habits
  const daysOfWeek = [
    { id: 0, name: 'Sun', full: 'Sunday' },
    { id: 1, name: 'Mon', full: 'Monday' },
    { id: 2, name: 'Tue', full: 'Tuesday' },
    { id: 3, name: 'Wed', full: 'Wednesday' },
    { id: 4, name: 'Thu', full: 'Thursday' },
    { id: 5, name: 'Fri', full: 'Friday' },
    { id: 6, name: 'Sat', full: 'Saturday' }
  ];

  // Get today's date string
  const getTodayString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    // Use local date (not UTC) so today matches the server's expected local day
    return `${year}-${month}-${day}`;
  };

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // API headers
  const getHeaders = () => {
    return {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json'
    };
  };

  // Load data on component mount and tab change
  useEffect(() => {
    if (selectedTab === 'today') {
      loadDailyHabits();
    } else if (selectedTab === 'habits') {
      loadHabits();
    } else if (selectedTab === 'stats') {
      loadStats();
    }
  }, [selectedTab]);

  // Load daily habits
  const loadDailyHabits = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/habits/daily?date=${getTodayString()}`, {
        headers: getHeaders()
      });
      
      if (response.ok) {
        const result = await response.json();
        setDailyHabits(result.data.habits || []);
      } else {
        console.error('Failed to load daily habits');
        setDailyHabits([]);
      }
    } catch (error) {
      console.error('Error loading daily habits:', error);
      setDailyHabits([]);
    } finally {
      setLoading(false);
    }
  };

  // Load all habits
  const loadHabits = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/habits', {
        headers: getHeaders()
      });
      
      if (response.ok) {
        const result = await response.json();
        setHabits(result.data || []);
      } else {
        console.error('Failed to load habits');
        setHabits([]);
      }
    } catch (error) {
      console.error('Error loading habits:', error);
      setHabits([]);
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/habits/stats', {
        headers: getHeaders()
      });
      
      if (response.ok) {
        const result = await response.json();
        setStats(result.data || {
          totalHabits: 0,
          activeStreaks: 0,
          longestStreak: 0,
          totalCompletions: 0
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Toggle habit completion
  const toggleHabitCompletion = async (instanceId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/habits/instances/${instanceId}/toggle`, {
        method: 'PATCH',
        headers: getHeaders()
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Update the daily habits list with the new data
        setDailyHabits(prev => prev.map(habit => 
          habit._id === instanceId 
            ? { 
                ...habit, 
                completed: result.data.completed,
                completedAt: result.data.completedAt,
                habit: {
                  ...habit.habit,
                  currentStreak: result.data.habitId.currentStreak,
                  longestStreak: result.data.habitId.longestStreak
                }
              }
            : habit
        ));
      } else {
        throw new Error('Failed to toggle habit');
      }
    } catch (error) {
      console.error('Error toggling habit:', error);
      alert('Failed to update habit. Please try again.');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'other',
      color: '#3B82F6',
      icon: 'target',
      schedule: { type: 'daily', days: [] },
      target: { value: '', unit: '' }
    });
  };

// Create new habit
  const createHabit = async () => {
    try {
      // Validate required fields
      if (!formData.title.trim()) {
        alert('Habit title is required');
        return;
      }

      if (formData.schedule.type === 'weekly' && formData.schedule.days.length === 0) {
        alert('Please select at least one day for weekly habits');
        return;
      }

      // Prepare data for API
      const habitData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        category: formData.category,
        color: formData.color,
        icon: formData.icon,
        schedule: {
          type: formData.schedule.type,
          days: formData.schedule.days
        }
      };

      // Add target if specified
      if (formData.target.value && formData.target.unit) {
        habitData.target = {
          value: parseInt(formData.target.value),
          unit: formData.target.unit.trim()
        };
      }

      const response = await fetch('http://localhost:5000/api/habits', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(habitData)
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Reset form and close modal
        resetForm();
        setShowCreateForm(false);
        
        // 🔥 IMPORTANT FIX: Always refresh both tabs after creating habit
        console.log('Habit created, refreshing data...');
        
        // Wait a moment for backend to process
        setTimeout(async () => {
          await loadHabits(); // Refresh habits tab
          await loadDailyHabits(); // Refresh today tab
          await loadStats(); // Refresh stats
        }, 500);
        
        alert('Habit created successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create habit');
      }
    } catch (error) {
      console.error('Error creating habit:', error);
      alert(`Error creating habit: ${error.message}`);
    }
  };

  // Edit habit
  const editHabit = (habit) => {
    setEditingHabit(habit);
    setFormData({
      title: habit.title,
      description: habit.description || '',
      category: habit.category,
      color: habit.color || '#3B82F6',
      icon: habit.icon || 'target',
      schedule: {
        type: habit.schedule.type,
        days: habit.schedule.days || []
      },
      target: {
        value: habit.target?.value || '',
        unit: habit.target?.unit || ''
      }
    });
    setShowEditForm(true);
  };

  // Update habit
  const updateHabit = async () => {
    try {
      if (!formData.title.trim()) {
        alert('Habit title is required');
        return;
      }

      if (formData.schedule.type === 'weekly' && formData.schedule.days.length === 0) {
        alert('Please select at least one day for weekly habits');
        return;
      }

      const habitData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        category: formData.category,
        color: formData.color,
        icon: formData.icon,
        schedule: {
          type: formData.schedule.type,
          days: formData.schedule.days
        }
      };

      if (formData.target.value && formData.target.unit) {
        habitData.target = {
          value: parseInt(formData.target.value),
          unit: formData.target.unit.trim()
        };
      }

      const response = await fetch(`http://localhost:5000/api/habits/${editingHabit._id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(habitData)
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Reset form and close modal
        resetForm();
        setShowEditForm(false);
        setEditingHabit(null);
        
        // Reload habits
        loadHabits();
        if (selectedTab === 'today') {
          loadDailyHabits();
        }
        
        alert('Habit updated successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update habit');
      }
    } catch (error) {
      console.error('Error updating habit:', error);
      alert(`Error updating habit: ${error.message}`);
    }
  };

  // Delete habit
  const deleteHabit = async (habitId, habitTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${habitTitle}"? This will remove all associated data.`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/habits/${habitId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      
      if (response.ok) {
        // Remove from local state
        setHabits(prev => prev.filter(habit => habit._id !== habitId));
        alert('Habit deleted successfully');
      } else {
        throw new Error('Failed to delete habit');
      }
    } catch (error) {
      console.error('Error deleting habit:', error);
      alert('Failed to delete habit. Please try again.');
    }
  };

  // Get category info
  const getCategoryInfo = (categoryId) => {
    return categories.find(cat => cat.id === categoryId) || categories[categories.length - 1];
  };

  // Format streak display
  const formatStreak = (streak) => {
    if (streak === 0) return '0';
    return `${streak}`;
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  // Toggle day selection for weekly habits
  const toggleDay = (dayId) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        days: prev.schedule.days.includes(dayId)
          ? prev.schedule.days.filter(d => d !== dayId)
          : [...prev.schedule.days, dayId]
      }
    }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Flame className="text-orange-600" size={32} />
          Habit Tracker
        </h1>
        
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors duration-200 flex items-center gap-2 font-medium"
        >
          <Plus size={20} />
          New Habit
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'today', name: 'Today', icon: Calendar },
          { id: 'habits', name: 'My Habits', icon: Target },
          { id: 'stats', name: 'Statistics', icon: BarChart3 }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                selectedTab === tab.id
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon size={18} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Today Tab */}
      {selectedTab === 'today' && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Today's Habits - {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h2>
            <p className="text-gray-600">Complete your daily habits to build consistency and streaks!</p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              <p className="mt-2 text-gray-600">Loading today's habits...</p>
            </div>
          ) : dailyHabits.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-500 text-lg mb-2">No habits scheduled for today</p>
              <p className="text-gray-400">Create your first habit to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dailyHabits.map((habitInstance) => {
                const categoryInfo = getCategoryInfo(habitInstance.habit.category);
                const CategoryIcon = categoryInfo.icon;
                
                return (
                  <div
                    key={habitInstance._id}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                      habitInstance.completed
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Completion Toggle */}
                      <button
                        onClick={() => toggleHabitCompletion(habitInstance._id)}
                        className={`flex-shrink-0 transition-colors duration-200 ${
                          habitInstance.completed 
                            ? 'text-green-600' 
                            : 'text-gray-400 hover:text-orange-600'
                        }`}
                        disabled={loading}
                      >
                        {habitInstance.completed ? <CheckCircle2 size={32} /> : <Circle size={32} />}
                      </button>

                      {/* Category Icon */}
                      <div 
                        className="flex-shrink-0 p-3 rounded-full"
                        style={{ backgroundColor: `${categoryInfo.color}20`, color: categoryInfo.color }}
                      >
                        <CategoryIcon size={24} />
                      </div>

                      {/* Habit Info */}
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold ${
                          habitInstance.completed ? 'line-through text-gray-500' : 'text-gray-800'
                        }`}>
                          {habitInstance.habit.title}
                        </h3>
                        
                        {habitInstance.habit.description && (
                          <p className="text-gray-600 text-sm mb-2">
                            {habitInstance.habit.description}
                          </p>
                        )}

                        {habitInstance.habit.target && habitInstance.habit.target.value && (
                          <p className="text-gray-500 text-sm">
                            Target: {habitInstance.habit.target.value} {habitInstance.habit.target.unit}
                          </p>
                        )}
                      </div>

                      {/* Streak Display */}
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <Flame className="text-orange-500" size={16} />
                          <span className="font-bold text-orange-600">
                            {formatStreak(habitInstance.habit.currentStreak)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">Current Streak</p>
                        
                        {habitInstance.habit.longestStreak > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <Trophy className="text-amber-500" size={14} />
                            <span className="text-xs text-gray-600">
                              Best: {habitInstance.habit.longestStreak}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Habits Tab */}
      {selectedTab === 'habits' && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">My Habits</h2>
            <p className="text-gray-600">Manage your habits and track your progress over time.</p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              <p className="mt-2 text-gray-600">Loading habits...</p>
            </div>
          ) : habits.length === 0 ? (
            <div className="text-center py-12">
              <Target className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-500 text-lg mb-2">No habits created yet</p>
              <p className="text-gray-400">Start building better habits today!</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {habits.map((habit) => {
                const categoryInfo = getCategoryInfo(habit.category);
                const CategoryIcon = categoryInfo.icon;
                
                return (
                  <div
                    key={habit._id}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div 
                        className="p-3 rounded-full"
                        style={{ backgroundColor: `${categoryInfo.color}20`, color: categoryInfo.color }}
                      >
                        <CategoryIcon size={24} />
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => editHabit(habit)}
                          className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => deleteHabit(habit._id, habit.title)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-semibold text-gray-800 mb-2">{habit.title}</h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Current Streak</span>
                        <div className="flex items-center gap-1">
                          <Flame className="text-orange-500" size={14} />
                          <span className="font-medium text-orange-600">
                            {formatStreak(habit.currentStreak)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Best Streak</span>
                        <div className="flex items-center gap-1">
                          <Trophy className="text-amber-500" size={14} />
                          <span className="font-medium text-amber-600">
                            {habit.longestStreak}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Completed</span>
                        <span className="font-medium">{habit.totalCompletions}</span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      {habit.schedule.type === 'daily' ? 'Daily' : 
                       habit.schedule.type === 'weekly' ? `${habit.schedule.days.length} days/week` :
                       'Custom schedule'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Statistics Tab */}
      {selectedTab === 'stats' && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Your Progress</h2>
            <p className="text-gray-600">Track your overall habit performance and achievements.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">Total Habits</p>
                  <p className="text-2xl font-bold text-orange-800">{stats.totalHabits}</p>
                </div>
                <Target className="text-orange-600" size={32} />
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">Active Streaks</p>
                  <p className="text-2xl font-bold text-red-800">{stats.activeStreaks}</p>
                </div>
                <Flame className="text-red-600" size={32} />
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600 text-sm font-medium">Longest Streak</p>
                  <p className="text-2xl font-bold text-amber-800">{stats.longestStreak}</p>
                </div>
                <Trophy className="text-amber-600" size={32} />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Total Completed</p>
                  <p className="text-2xl font-bold text-green-800">{stats.totalCompletions}</p>
                </div>
                <TrendingUp className="text-green-600" size={32} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Habit Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Create New Habit</h2>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); createHabit(); }} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Habit Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Read 10 pages, Morning workout"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Add more details about your habit..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {categories.map(category => {
                      const Icon = category.icon;
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => handleInputChange('category', category.id)}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                            formData.category === category.id
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon 
                            size={20} 
                            className="mx-auto mb-1" 
                            style={{ color: category.color }}
                          />
                          <p className="text-xs font-medium">{category.name}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule
                  </label>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      {[
                        { id: 'daily', name: 'Daily', desc: 'Every day' },
                        { id: 'weekly', name: 'Weekly', desc: 'Specific days' }
                      ].map(schedule => (
                        <button
                          key={schedule.id}
                          type="button"
                          onClick={() => handleInputChange('schedule.type', schedule.id)}
                          className={`flex-1 p-4 rounded-lg border-2 transition-all duration-200 ${
                            formData.schedule.type === schedule.id
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <p className="font-medium">{schedule.name}</p>
                          <p className="text-sm text-gray-600">{schedule.desc}</p>
                        </button>
                      ))}
                    </div>

                    {formData.schedule.type === 'weekly' && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Select Days</p>
                        <div className="flex gap-2">
                          {daysOfWeek.map(day => (
                            <button
                              key={day.id}
                              type="button"
                              onClick={() => toggleDay(day.id)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                formData.schedule.days.includes(day.id)
                                  ? 'bg-orange-600 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {day.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target (Optional)
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={formData.target.value}
                      onChange={(e) => handleInputChange('target.value', e.target.value)}
                      placeholder="10"
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <input
                      type="text"
                      value={formData.target.unit}
                      onChange={(e) => handleInputChange('target.unit', e.target.value)}
                      placeholder="pages, minutes, etc."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      resetForm();
                    }}
                    className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!formData.title.trim() || loading}
                    className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
                  >
                    <Check size={16} />
                    Create Habit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Habit Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Edit Habit</h2>
                <button
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingHabit(null);
                    resetForm();
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); updateHabit(); }} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Habit Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Read 10 pages, Morning workout"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Add more details about your habit..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {categories.map(category => {
                      const Icon = category.icon;
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => handleInputChange('category', category.id)}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                            formData.category === category.id
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon 
                            size={20} 
                            className="mx-auto mb-1" 
                            style={{ color: category.color }}
                          />
                          <p className="text-xs font-medium">{category.name}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule
                  </label>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      {[
                        { id: 'daily', name: 'Daily', desc: 'Every day' },
                        { id: 'weekly', name: 'Weekly', desc: 'Specific days' }
                      ].map(schedule => (
                        <button
                          key={schedule.id}
                          type="button"
                          onClick={() => handleInputChange('schedule.type', schedule.id)}
                          className={`flex-1 p-4 rounded-lg border-2 transition-all duration-200 ${
                            formData.schedule.type === schedule.id
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <p className="font-medium">{schedule.name}</p>
                          <p className="text-sm text-gray-600">{schedule.desc}</p>
                        </button>
                      ))}
                    </div>

                    {formData.schedule.type === 'weekly' && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Select Days</p>
                        <div className="flex gap-2">
                          {daysOfWeek.map(day => (
                            <button
                              key={day.id}
                              type="button"
                              onClick={() => toggleDay(day.id)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                formData.schedule.days.includes(day.id)
                                  ? 'bg-orange-600 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {day.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target (Optional)
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={formData.target.value}
                      onChange={(e) => handleInputChange('target.value', e.target.value)}
                      placeholder="10"
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <input
                      type="text"
                      value={formData.target.unit}
                      onChange={(e) => handleInputChange('target.unit', e.target.value)}
                      placeholder="pages, minutes, etc."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingHabit(null);
                      resetForm();
                    }}
                    className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!formData.title.trim() || loading}
                    className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
                  >
                    <Check size={16} />
                    Update Habit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitTracker;