
const mongoose = require('mongoose');

const WorkoutRoutineSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  exercises: [{
    exercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'exercise'
    },
    name: String,
    muscle_group: String,
    default_sets: {
      type: Number,
      default: 3
    },
    default_reps: {
      type: Number,
      default: 10
    }
  }],
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('workout_routine', WorkoutRoutineSchema);
