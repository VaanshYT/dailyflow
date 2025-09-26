const Habit = require('../models/Habit');
const HabitInstance = require('../models/HabitInstance');

// Get today's date in YYYY-MM-DD format
const getTodayString = () => {
  return new Date().toISOString().split('T')[0];
};

// @desc    Get all active habits for user
// @route   GET /api/habits
// @access  Private
const getHabits = async (req, res) => {
  try {
    const userId = req.user._id;
    const habits = await Habit.getActiveHabits(userId);

    res.status(200).json({
      success: true,
      data: habits
    });
  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching habits',
      error: error.message
    });
  }
};

// @desc    Get habits and instances for a specific date (for daily view)
// @route   GET /api/habits/daily
// @access  Private
const getDailyHabits = async (req, res) => {
  try {
    const userId = req.user._id;
    const date = req.query.date || getTodayString();

    // Get habits that should occur on this date
    const habitsForDate = await Habit.getHabitsForDate(userId, date);
    
    // Get existing instances for this date
    const instances = await HabitInstance.getInstancesForDate(userId, date);
    
    // Create a map of existing instances by habitId
    const instanceMap = new Map();
    instances.forEach(instance => {
      instanceMap.set(instance.habitId._id.toString(), instance);
    });
    
    // Generate habit instances for habits that don't have instances yet
    const habitInstances = await Promise.all(
      habitsForDate.map(async (habit) => {
        const habitId = habit._id.toString();
        let instance = instanceMap.get(habitId);
        
        if (!instance) {
          // Create new instance for today
          instance = new HabitInstance({
            habitId: habit._id,
            userId,
            date,
            completed: false
          });
          await instance.save();
        }
        
        return {
          _id: instance._id,
          habit: {
            _id: habit._id,
            title: habit.title,
            description: habit.description,
            category: habit.category,
            color: habit.color,
            icon: habit.icon,
            target: habit.target,
            currentStreak: habit.currentStreak,
            longestStreak: habit.longestStreak
          },
          completed: instance.completed,
          completedAt: instance.completedAt,
          actualValue: instance.actualValue,
          notes: instance.notes,
          date: instance.date
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        date,
        habits: habitInstances
      }
    });
  } catch (error) {
    console.error('Error fetching daily habits:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching daily habits',
      error: error.message
    });
  }
};

// @desc    Create a new habit
// @route   POST /api/habits
// @access  Private
const createHabit = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      title,
      description,
      category,
      color,
      icon,
      schedule,
      target,
      startDate,
      endDate
    } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Habit title is required'
      });
    }

    if (!schedule || !schedule.type) {
      return res.status(400).json({
        success: false,
        message: 'Schedule type is required'
      });
    }

    // Validate schedule
    if (schedule.type === 'weekly' && (!schedule.days || schedule.days.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Weekly habits must specify at least one day'
      });
    }

    // Normalize default startDate to midnight local to avoid off-by-one issues
    const todayAtMidnight = new Date();
    todayAtMidnight.setHours(0, 0, 0, 0);

    const habit = new Habit({
      title: title.trim(),
      description: description?.trim(),
      category: category || 'other',
      color: color || '#3B82F6',
      icon: icon || 'target',
      schedule,
      target,
      startDate: startDate ? new Date(startDate) : todayAtMidnight,
      endDate: endDate ? new Date(endDate) : null,
      userId
    });

    const savedHabit = await habit.save();

    // 🔥 IMPORTANT FIX: Create today's habit instance if habit should occur today
    // Use local midnight date string for today so it matches frontend and comparisons
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const today = `${yyyy}-${mm}-${dd}`;
    
    // Check if this habit should occur today
    if (savedHabit.shouldOccurOnDate(today)) {
      console.log(`Creating instance for habit: ${savedHabit.title} on ${today}`);
      
      const HabitInstance = require('../models/HabitInstance');
      
      // Check if instance already exists for today (shouldn't, but just in case)
      const existingInstance = await HabitInstance.findOne({
        habitId: savedHabit._id,
        userId,
        date: today
      });
      
      if (!existingInstance) {
        const newInstance = new HabitInstance({
          habitId: savedHabit._id,
          userId,
          date: today,
          completed: false
        });
        
        await newInstance.save();
        console.log(`Successfully created habit instance for ${savedHabit.title}`);
      } else {
        console.log(`Instance already exists for ${savedHabit.title} on ${today}`);
      }
    } else {
      console.log(`Habit ${savedHabit.title} should NOT occur on ${today}`);
    }

    res.status(201).json({
      success: true,
      data: savedHabit
    });
  } catch (error) {
    console.error('Error creating habit:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating habit',
      error: error.message
    });
  }
};

// @desc    Update a habit
// @route   PUT /api/habits/:id
// @access  Private
const updateHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const habit = await Habit.findOne({ _id: id, userId });
    
    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found or unauthorized'
      });
    }

    // Update allowed fields
    const allowedFields = ['title', 'description', 'category', 'color', 'icon', 'schedule', 'target', 'isActive', 'endDate'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        habit[field] = req.body[field];
      }
    });

    const updatedHabit = await habit.save();

    res.status(200).json({
      success: true,
      data: updatedHabit
    });
  } catch (error) {
    console.error('Error updating habit:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating habit',
      error: error.message
    });
  }
};

// @desc    Delete a habit (soft delete by setting isActive to false)
// @route   DELETE /api/habits/:id
// @access  Private
const deleteHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const habit = await Habit.findOne({ _id: id, userId });
    
    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found or unauthorized'
      });
    }

    // Soft delete
    habit.isActive = false;
    await habit.save();

    res.status(200).json({
      success: true,
      message: 'Habit deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting habit:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting habit',
      error: error.message
    });
  }
};

// @desc    Toggle habit instance completion
// @route   PATCH /api/habits/instances/:id/toggle
// @access  Private
const toggleHabitInstance = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const instance = await HabitInstance.findOne({ _id: id, userId });
    
    if (!instance) {
      return res.status(404).json({
        success: false,
        message: 'Habit instance not found or unauthorized'
      });
    }

    const updatedInstance = await instance.toggleCompletion();
    await updatedInstance.populate('habitId');

    res.status(200).json({
      success: true,
      data: updatedInstance
    });
  } catch (error) {
    console.error('Error toggling habit instance:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling habit instance',
      error: error.message
    });
  }
};

// @desc    Update habit instance (notes, actual value, etc.)
// @route   PUT /api/habits/instances/:id
// @access  Private
const updateHabitInstance = async (req, res) => {
  try {
    const { id } = req.params;
    const { actualValue, notes, completed } = req.body;
    const userId = req.user._id;

    const instance = await HabitInstance.findOne({ _id: id, userId });
    
    if (!instance) {
      return res.status(404).json({
        success: false,
        message: 'Habit instance not found or unauthorized'
      });
    }

    // Update fields
    if (actualValue !== undefined) instance.actualValue = actualValue;
    if (notes !== undefined) instance.notes = notes;
    if (completed !== undefined) {
      instance.completed = completed;
      if (completed && !instance.completedAt) {
        instance.completedAt = new Date();
      } else if (!completed) {
        instance.completedAt = null;
      }
    }

    const updatedInstance = await instance.save();

    // Update habit streak if completion status changed
    if (completed !== undefined) {
      const Habit = require('../models/Habit');
      const habit = await Habit.findById(instance.habitId);
      if (habit) {
        await habit.updateStreak(instance.date, completed);
      }
    }

    await updatedInstance.populate('habitId');

    res.status(200).json({
      success: true,
      data: updatedInstance
    });
  } catch (error) {
    console.error('Error updating habit instance:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating habit instance',
      error: error.message
    });
  }
};

// @desc    Get habit statistics for user
// @route   GET /api/habits/stats
// @access  Private
const getHabitStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const stats = await Habit.getUserHabitStats(userId);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching habit statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching habit statistics',
      error: error.message
    });
  }
};

// @desc    Get habit details with completion history
// @route   GET /api/habits/:id/details
// @access  Private
const getHabitDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { days = 30 } = req.query;

    const habit = await Habit.findOne({ _id: id, userId });
    
    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found or unauthorized'
      });
    }

    // Get completion history for the last N days
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    const startDateStr = startDate.toISOString().split('T')[0];

    const instances = await HabitInstance.getHabitInstances(id, startDateStr, endDate);
    const completionRate = await HabitInstance.getCompletionRate(id, parseInt(days));

    res.status(200).json({
      success: true,
      data: {
        habit,
        instances,
        completionRate,
        period: { startDate: startDateStr, endDate, days: parseInt(days) }
      }
    });
  } catch (error) {
    console.error('Error fetching habit details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching habit details',
      error: error.message
    });
  }
};

module.exports = {
  getHabits,
  getDailyHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  toggleHabitInstance,
  updateHabitInstance,
  getHabitStats,
  getHabitDetails
};