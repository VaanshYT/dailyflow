import React, { useState, useEffect } from 'react';
import { Plus, Check, Edit3, Trash2, Calendar, Clock, CheckCircle2, Circle, Target, TrendingUp, Search, Filter } from 'lucide-react';

const DailyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Get today's date in YYYY-MM-DD format
  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Load tasks when component mounts
  useEffect(() => {
    loadTasks();
  }, []);

  // API call to load today's tasks
  const loadTasks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const today = getTodayString();
      
      const response = await fetch(`http://localhost:5000/api/tasks/daily?date=${today}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setTasks(result.data.tasks || []);
      } else {
        console.error('Failed to load tasks');
        // Fallback to localStorage
        const savedTasks = localStorage.getItem(`dailyTasks_${getTodayString()}`);
        if (savedTasks) {
          setTasks(JSON.parse(savedTasks));
        }
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      // Fallback to localStorage
      const savedTasks = localStorage.getItem(`dailyTasks_${getTodayString()}`);
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    } finally {
      setLoading(false);
    }
  };

  // Add new task
  const addTask = async () => {
    if (!newTask.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      const today = getTodayString();
      
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          text: newTask.trim(),
          date: today 
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setTasks(prev => [...prev, result.data]);
        setNewTask('');
      } else {
        throw new Error('Failed to create task');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      // Fallback to local storage
      const task = {
        _id: Date.now().toString(),
        text: newTask.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
        date: getTodayString()
      };
      const updatedTasks = [...tasks, task];
      setTasks(updatedTasks);
      localStorage.setItem(`dailyTasks_${getTodayString()}`, JSON.stringify(updatedTasks));
      setNewTask('');
    }
  };

  // Toggle task completion
  const toggleTask = async (id) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/tasks/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setTasks(prev => prev.map(task => 
          task._id === id ? result.data : task
        ));
      } else {
        throw new Error('Failed to toggle task');
      }
    } catch (error) {
      console.error('Error toggling task:', error);
      // Fallback to local update
      const updatedTasks = tasks.map(task => 
        task._id === id 
          ? { ...task, completed: !task.completed, updatedAt: new Date().toISOString() }
          : task
      );
      setTasks(updatedTasks);
      localStorage.setItem(`dailyTasks_${getTodayString()}`, JSON.stringify(updatedTasks));
    }
  };

  // Start editing task
  const startEditing = (id, text) => {
    setEditingId(id);
    setEditingText(text);
  };

  // Save edited task
  const saveEdit = async () => {
    if (!editingText.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/tasks/${editingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          text: editingText.trim()
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setTasks(prev => prev.map(task => 
          task._id === editingId ? result.data : task
        ));
        setEditingId(null);
        setEditingText('');
      } else {
        throw new Error('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      // Fallback to local update
      const updatedTasks = tasks.map(task =>
        task._id === editingId
          ? { ...task, text: editingText.trim(), updatedAt: new Date().toISOString() }
          : task
      );
      setTasks(updatedTasks);
      localStorage.setItem(`dailyTasks_${getTodayString()}`, JSON.stringify(updatedTasks));
      setEditingId(null);
      setEditingText('');
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  // Delete task
  const deleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`http://localhost:5000/api/tasks/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          setTasks(prev => prev.filter(task => task._id !== id));
        } else {
          throw new Error('Failed to delete task');
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        // Fallback to local update
        const updatedTasks = tasks.filter(task => task._id !== id);
        setTasks(updatedTasks);
        localStorage.setItem(`dailyTasks_${getTodayString()}`, JSON.stringify(updatedTasks));
      }
    }
  };

  // Filter tasks based on completion status and search term
  const filteredTasks = tasks.filter(task => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'completed' && task.completed) || 
      (filter === 'pending' && !task.completed);
    
    const matchesSearch = task.text.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (editingId) {
        saveEdit();
      } else {
        addTask();
      }
    } else if (e.key === 'Escape' && editingId) {
      cancelEdit();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Target className="text-orange-600" size={32} />
            Daily Tasks
          </h1>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <Calendar size={16} />
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Total Tasks</p>
                <p className="text-2xl font-bold text-orange-800">{totalTasks}</p>
              </div>
              <Target className="text-orange-600" size={24} />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-800">{completedTasks}</p>
              </div>
              <CheckCircle2 className="text-green-600" size={24} />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-sm font-medium">Progress</p>
                <p className="text-2xl font-bold text-amber-800">{completionRate}%</p>
              </div>
              <TrendingUp className="text-amber-600" size={24} />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Daily Progress</span>
            <span className="text-sm font-medium text-gray-800">{completedTasks}/{totalTasks}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-orange-500 to-amber-500 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Add Task Input */}
      <div className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Add a new daily task... (e.g., Solve 2 DP problems)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800 placeholder-gray-500"
            />
          </div>
          <button
            onClick={addTask}
            disabled={!newTask.trim()}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2 font-medium"
          >
            <Plus size={20} />
            Add Task
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              filter === 'all' 
                ? 'bg-orange-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All ({totalTasks})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              filter === 'pending' 
                ? 'bg-orange-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pending ({totalTasks - completedTasks})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              filter === 'completed' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Done ({completedTasks})
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <p className="mt-2 text-gray-600">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <Target className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-500 text-lg mb-2">
              {searchTerm || filter !== 'all' ? 'No tasks match your filters' : 'No tasks for today yet'}
            </p>
            <p className="text-gray-400">
              {searchTerm || filter !== 'all' ? 'Try adjusting your search or filter' : 'Add your first task above to get started!'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task._id}
              className={`flex items-center gap-4 p-4 bg-white border rounded-lg transition-all duration-200 hover:shadow-md ${
                task.completed ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:border-orange-300'
              }`}
            >
              {/* Completion Toggle */}
              <button
                onClick={() => toggleTask(task._id)}
                className={`flex-shrink-0 transition-colors duration-200 ${
                  task.completed ? 'text-green-600' : 'text-gray-400 hover:text-orange-600'
                }`}
              >
                {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
              </button>

              {/* Task Text */}
              <div className="flex-1">
                {editingId === task._id ? (
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="w-full px-2 py-1 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    autoFocus
                  />
                ) : (
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-lg ${
                        task.completed 
                          ? 'line-through text-gray-500' 
                          : 'text-gray-800'
                      }`}
                    >
                      {task.text}
                    </span>
                    {task.completed && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        ✓ Done
                      </span>
                    )}
                  </div>
                )}
                
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(task.createdAt).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  {task.updatedAt !== task.createdAt && (
                    <span>• Updated {new Date(task.updatedAt).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {editingId === task._id ? (
                  <>
                    <button
                      onClick={saveEdit}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-200"
                      title="Save changes"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                      title="Cancel editing"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEditing(task._id, task.text)}
                      className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors duration-200"
                      title="Edit task"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => deleteTask(task._id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                      title="Delete task"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Stats */}
      {tasks.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {completedTasks > 0 && (
                <>🎉 Great job! You've completed {completedTasks} task{completedTasks !== 1 ? 's' : ''} today.</>
              )}
            </span>
            <span>
              {totalTasks - completedTasks > 0 && (
                <>{totalTasks - completedTasks} task{(totalTasks - completedTasks) !== 1 ? 's' : ''} remaining</>
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyTasks;