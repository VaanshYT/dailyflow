const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Task text is required'],
    trim: true,
    maxlength: [500, 'Task text cannot exceed 500 characters']
  },
  completed: {
    type: Boolean,
    default: false
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: [true, 'Task date is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
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
taskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create compound index for efficient queries
taskSchema.index({ userId: 1, date: 1 });

// Instance method to toggle completion
taskSchema.methods.toggleCompletion = function() {
  this.completed = !this.completed;
  return this.save();
};

// Static method to get tasks for a specific user and date
taskSchema.statics.getTasksForDate = function(userId, date) {
  return this.find({ userId, date }).sort({ createdAt: 1 });
};

// Static method to get user's task statistics
taskSchema.statics.getUserStats = async function(userId, date) {
  const tasks = await this.find({ userId, date });
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  return {
    totalTasks,
    completedTasks,
    completionRate,
    pendingTasks: totalTasks - completedTasks
  };
};

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;