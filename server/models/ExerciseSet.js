const mongoose = require('mongoose');

const exerciseSetSchema = new mongoose.Schema({
  workout_exercise: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutExercise', required: true },
  set_number: Number,
  weight_kg: { type: Number, default: 0 },
  reps: { type: Number, default: 0 },
  is_completed: { type: Boolean, default: false }
});

module.exports = mongoose.model('ExerciseSet', exerciseSetSchema);