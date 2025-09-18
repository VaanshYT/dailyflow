const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth'); // 👈 Fixed import
const {
  getDailyTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
  syncTasks,
  getTaskStats
} = require('../controllers/taskController');

// All routes require authentication
router.use(protect); // 👈 Using your protect middleware

// @route   GET /api/tasks/daily
// @desc    Get daily tasks for authenticated user
// @access  Private
router.get('/daily', getDailyTasks);

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', createTask);

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', updateTask);

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', deleteTask);

// @route   PATCH /api/tasks/:id/toggle
// @desc    Toggle task completion status
// @access  Private
router.patch('/:id/toggle', toggleTaskCompletion);

// @route   POST /api/tasks/sync
// @desc    Bulk sync tasks (for offline functionality)
// @access  Private
router.post('/sync', syncTasks);

// @route   GET /api/tasks/stats
// @desc    Get user's task statistics
// @access  Private
router.get('/stats', getTaskStats);

module.exports = router;