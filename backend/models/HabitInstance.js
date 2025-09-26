const mongoose = require('mongoose');

const habitInstanceSchema = new mongoose.Schema({
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: [true, 'Habit ID is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: [true, 'Date is required']
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  // Optional: actual value achieved (e.g., "Read 15 pages" when target was 10)
  actualValue: {
    type: Number
  },
  notes: {
    type: String,
    maxlength: [200, 'Notes cannot exceed 200 characters']
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
habitInstanceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set completedAt when marking as completed
  if (this.completed && !this.completedAt) {
    this.completedAt = new Date();
  } else if (!this.completed) {
    this.completedAt = null;
  }
  
  next();
});

// Compound index for efficient queries
habitInstanceSchema.index({ userId: 1, date: 1 });
habitInstanceSchema.index({ habitId: 1, date: 1 });
habitInstanceSchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true });

// Static method to get habit instances for a specific date
habitInstanceSchema.statics.getInstancesForDate = function(userId, date) {
  return this.find({ userId, date })
    .populate('habitId')
    .sort({ createdAt: 1 });
};

// Static method to get instances for a habit within a date range
habitInstanceSchema.statics.getHabitInstances = function(habitId, startDate, endDate) {
  const query = { habitId };
  
  if (startDate && endDate) {
    query.date = { $gte: startDate, $lte: endDate };
  } else if (startDate) {
    query.date = { $gte: startDate };
  } else if (endDate) {
    query.date = { $lte: endDate };
  }
  
  return this.find(query).sort({ date: 1 });
};

// Static method to calculate streak for a habit
habitInstanceSchema.statics.calculateStreak = async function(habitId, currentDate) {
  const instances = await this.find({ habitId, completed: true })
    .sort({ date: -1 })
    .limit(100); // Limit for performance
  
  if (instances.length === 0) return 0;
  
  let streak = 0;
  let checkDate = currentDate;
  
  for (const instance of instances) {
    if (instance.date === checkDate) {
      streak++;
      // Move to previous day
      const prevDate = new Date(checkDate);
      prevDate.setDate(prevDate.getDate() - 1);
      checkDate = prevDate.toISOString().split('T')[0];
    } else {
      break; // Streak is broken
    }
  }
  
  return streak;
};

// Static method to get completion rate for a habit
habitInstanceSchema.statics.getCompletionRate = async function(habitId, days = 30) {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];
  
  const instances = await this.find({
    habitId,
    date: { $gte: startDateStr, $lte: endDate }
  });
  
  const totalDays = instances.length;
  const completedDays = instances.filter(instance => instance.completed).length;
  
  return {
    totalDays,
    completedDays,
    completionRate: totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0
  };
};

// Instance method to toggle completion
habitInstanceSchema.methods.toggleCompletion = async function() {
  this.completed = !this.completed;
  
  if (this.completed) {
    this.completedAt = new Date();
  } else {
    this.completedAt = null;
  }
  
  await this.save();
  
  // Update habit streak
  const Habit = mongoose.model('Habit');
  const habit = await Habit.findById(this.habitId);
  if (habit) {
    await habit.updateStreak(this.date, this.completed);
  }
  
  return this;
};

const HabitInstance = mongoose.model('HabitInstance', habitInstanceSchema);

module.exports = HabitInstance;