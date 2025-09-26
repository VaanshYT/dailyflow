const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth'); // Using your existing auth middleware
const {
  getHabits,
  getDailyHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  toggleHabitInstance,
  updateHabitInstance,
  getHabitStats,
  getHabitDetails
} = require('../controllers/habitController');

// All routes require authentication
router.use(protect);

// @route   GET /api/habits
// @desc    Get all active habits for authenticated user
// @access  Private
router.get('/', getHabits);

// @route   GET /api/habits/daily
// @desc    Get habits and instances for a specific date (daily view)
// @access  Private
router.get('/daily', getDailyHabits);

// @route   GET /api/habits/stats
// @desc    Get habit statistics for user
// @access  Private
router.get('/stats', getHabitStats);

// @route   GET /api/habits/:id/details
// @desc    Get habit details with completion history
// @access  Private
router.get('/:id/details', getHabitDetails);

// @route   POST /api/habits
// @desc    Create a new habit
// @access  Private
router.post('/', createHabit);

// @route   PUT /api/habits/:id
// @desc    Update a habit
// @access  Private
router.put('/:id', updateHabit);

// @route   DELETE /api/habits/:id
// @desc    Delete a habit (soft delete)
// @access  Private
router.delete('/:id', deleteHabit);

// @route   PATCH /api/habits/instances/:id/toggle
// @desc    Toggle habit instance completion
// @access  Private
router.patch('/instances/:id/toggle', toggleHabitInstance);

// @route   PUT /api/habits/instances/:id
// @desc    Update habit instance (notes, actual value, etc.)
// @access  Private
router.put('/instances/:id', updateHabitInstance);

module.exports = router;