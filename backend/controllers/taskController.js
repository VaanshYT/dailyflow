const Task = require('../models/Task');

// Get today's date in YYYY-MM-DD format
const getTodayString = () => {
  return new Date().toISOString().split('T')[0];
};

// @desc    Get daily tasks for authenticated user
// @route   GET /api/tasks/daily
// @access  Private
const getDailyTasks = async (req, res) => {
  try {
    const userId = req.user._id; // 👈 Fixed: using _id from your auth
    const date = req.query.date || getTodayString();

    // Get tasks for the specified date
    const tasks = await Task.getTasksForDate(userId, date);
    
    // Get user statistics for the date
    const stats = await Task.getUserStats(userId, date);

    res.status(200).json({
      success: true,
      data: {
        tasks,
        stats,
        date
      }
    });
  } catch (error) {
    console.error('Error fetching daily tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching daily tasks',
      error: error.message
    });
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { text, date } = req.body;
    const userId = req.user._id; // 👈 Fixed: using _id from your auth

    // Validation
    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Task text is required'
      });
    }

    const taskDate = date || getTodayString();

    // Create new task
    const task = new Task({
      text: text.trim(),
      date: taskDate,
      userId
    });

    const savedTask = await task.save();

    res.status(201).json({
      success: true,
      data: savedTask
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating task',
      error: error.message
    });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, completed } = req.body;
    const userId = req.user._id; // 👈 Fixed: using _id from your auth

    // Find task and verify ownership
    const task = await Task.findOne({ _id: id, userId });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized'
      });
    }

    // Update fields
    if (text !== undefined) {
      if (!text.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Task text cannot be empty'
        });
      }
      task.text = text.trim();
    }
    
    if (completed !== undefined) {
      task.completed = Boolean(completed);
    }

    const updatedTask = await task.save();

    res.status(200).json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task',
      error: error.message
    });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id; // 👈 Fixed: using _id from your auth

    // Find task and verify ownership
    const task = await Task.findOne({ _id: id, userId });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized'
      });
    }

    await Task.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: error.message
    });
  }
};

// @desc    Toggle task completion
// @route   PATCH /api/tasks/:id/toggle
// @access  Private
const toggleTaskCompletion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id; // 👈 Fixed: using _id from your auth

    // Find task and verify ownership
    const task = await Task.findOne({ _id: id, userId });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized'
      });
    }

    // Toggle completion
    const updatedTask = await task.toggleCompletion();

    res.status(200).json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    console.error('Error toggling task completion:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling task completion',
      error: error.message
    });
  }
};

// @desc    Bulk sync tasks (for offline sync)
// @route   POST /api/tasks/sync
// @access  Private
const syncTasks = async (req, res) => {
  try {
    const { tasks, date } = req.body;
    const userId = req.user._id; // 👈 Fixed: using _id from your auth
    const syncDate = date || getTodayString();

    if (!Array.isArray(tasks)) {
      return res.status(400).json({
        success: false,
        message: 'Tasks must be an array'
      });
    }

    // Remove existing tasks for this date and user
    await Task.deleteMany({ userId, date: syncDate });

    // Insert new tasks
    const tasksToInsert = tasks.map(task => ({
      text: task.text,
      completed: task.completed || false,
      date: syncDate,
      userId,
      createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
      updatedAt: task.updatedAt ? new Date(task.updatedAt) : new Date()
    }));

    const savedTasks = await Task.insertMany(tasksToInsert);

    // Get updated statistics
    const stats = await Task.getUserStats(userId, syncDate);

    res.status(200).json({
      success: true,
      data: {
        tasks: savedTasks,
        stats,
        date: syncDate
      }
    });
  } catch (error) {
    console.error('Error syncing tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error syncing tasks',
      error: error.message
    });
  }
};

// @desc    Get user's task statistics for a date range
// @route   GET /api/tasks/stats
// @access  Private
const getTaskStats = async (req, res) => {
  try {
    const userId = req.user._id; // 👈 Fixed: using _id from your auth
    const { startDate, endDate } = req.query;
    
    const start = startDate || getTodayString();
    const end = endDate || getTodayString();

    const tasks = await Task.find({
      userId,
      date: { $gte: start, $lte: end }
    });

    const stats = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(task => task.completed).length,
      pendingTasks: tasks.filter(task => !task.completed).length,
      completionRate: tasks.length > 0 ? Math.round((tasks.filter(task => task.completed).length / tasks.length) * 100) : 0,
      dateRange: { start, end }
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching task statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching task statistics',
      error: error.message
    });
  }
};

module.exports = {
  getDailyTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
  syncTasks,
  getTaskStats
};