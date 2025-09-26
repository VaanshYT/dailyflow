const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Habit title is required'],
    trim: true,
    maxlength: [100, 'Habit title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    enum: ['health', 'fitness', 'learning', 'productivity', 'mindfulness', 'social', 'creative', 'other'],
    default: 'other'
  },
  color: {
    type: String,
    default: '#3B82F6' // Blue
  },
  icon: {
    type: String,
    default: 'target'
  },
  schedule: {
    type: {
      type: String,
      enum: ['daily', 'weekly', 'custom'],
      required: true
    },
    // For weekly habits - days of week (0=Sunday, 1=Monday, etc.)
    days: [{
      type: Number,
      min: 0,
      max: 6
    }],
    // For custom schedules - specific dates
    customDates: [Date]
  },
  target: {
    // Optional: numeric target (e.g., "Read 10 pages", "Run 5km")
    value: {
      type: Number,
      min: 0
    },
    unit: {
      type: String,
      maxlength: 20
    }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date // Optional - for habits with end dates
  },
  // Streak tracking
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastCompletedDate: {
    type: String // Format: YYYY-MM-DD
  },
  // Statistics
  totalCompletions: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
habitSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
habitSchema.index({ userId: 1, isActive: 1 });
habitSchema.index({ userId: 1, 'schedule.type': 1 });

// Instance method to check if habit should occur on a specific date
habitSchema.methods.shouldOccurOnDate = function(date) {
  const toMidnight = (d) => {
    const dt = new Date(d);
    dt.setHours(0, 0, 0, 0);
    return dt;
  };

  const dateObj = toMidnight(date);
  const dayOfWeek = dateObj.getDay(); // 0=Sunday, 1=Monday, etc.
  
  // Check if habit is active and within date range (normalized to midnight)
  if (!this.isActive) return false;
  if (this.startDate && toMidnight(this.startDate) > dateObj) return false;
  if (this.endDate && toMidnight(this.endDate) < dateObj) return false;
  
  switch (this.schedule.type) {
    case 'daily':
      return true;
    case 'weekly':
      return this.schedule.days.includes(dayOfWeek);
    case 'custom':
      return this.schedule.customDates.some(customDate => 
        toMidnight(customDate).getTime() === dateObj.getTime()
      );
    default:
      return false;
  }
};

// Instance method to update streak
habitSchema.methods.updateStreak = function(completionDate, isCompleted) {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  if (isCompleted) {
    this.totalCompletions += 1;
    
    // Check if this extends current streak
    if (this.lastCompletedDate === yesterday || 
        (this.lastCompletedDate === null && completionDate === today)) {
      this.currentStreak += 1;
    } else if (completionDate === today) {
      this.currentStreak = 1;
    }
    
    // Update longest streak if needed
    if (this.currentStreak > this.longestStreak) {
      this.longestStreak = this.currentStreak;
    }
    
    this.lastCompletedDate = completionDate;
  } else {
    // Habit was uncompleted
    this.totalCompletions = Math.max(0, this.totalCompletions - 1);
    
    // Reset streak if it was today
    if (this.lastCompletedDate === completionDate) {
      this.currentStreak = 0;
      this.lastCompletedDate = null;
      
      // Find the most recent completion to recalculate streak
      // This would typically be done with a more complex query
    }
  }
  
  return this.save();
};

// Static method to get active habits for a user
habitSchema.statics.getActiveHabits = function(userId) {
  return this.find({ userId, isActive: true }).sort({ createdAt: -1 });
};

// Static method to get habits that should occur on a specific date
habitSchema.statics.getHabitsForDate = function(userId, date) {
  return this.find({ userId, isActive: true }).then(habits => {
    return habits.filter(habit => habit.shouldOccurOnDate(date));
  });
};

// Static method to get user habit statistics
habitSchema.statics.getUserHabitStats = async function(userId) {
  const habits = await this.find({ userId, isActive: true });
  
  const totalHabits = habits.length;
  const totalCompletions = habits.reduce((sum, habit) => sum + habit.totalCompletions, 0);
  const activeStreaks = habits.filter(habit => habit.currentStreak > 0).length;
  const longestStreak = Math.max(...habits.map(habit => habit.longestStreak), 0);
  
  return {
    totalHabits,
    totalCompletions,
    activeStreaks,
    longestStreak,
    habits: habits.map(habit => ({
      id: habit._id,
      title: habit.title,
      currentStreak: habit.currentStreak,
      longestStreak: habit.longestStreak,
      totalCompletions: habit.totalCompletions,
      category: habit.category,
      color: habit.color
    }))
  };
};

const Habit = mongoose.model('Habit', habitSchema);

module.exports = Habit;