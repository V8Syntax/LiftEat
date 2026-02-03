const mongoose = require('mongoose');

const workoutExerciseSchema = new mongoose.Schema({
  workout_session: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutSession', required: true },
  exercise_name: String,
  muscle_group: String,
  order_index: Number
});

module.exports = mongoose.model('WorkoutExercise', workoutExerciseSchema);