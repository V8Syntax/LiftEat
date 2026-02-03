const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const WorkoutSession = require('../models/WorkoutSession');
const WorkoutExercise = require('../models/WorkoutExercise');
const ExerciseSet = require('../models/ExerciseSet');
const Exercise = require('../models/Exercise');

// Get Overview (Active + Recent)
router.get('/overview', auth, async (req, res) => {
  const activeWorkout = await WorkoutSession.findOne({ user: req.user.id, is_active: true });
  const recentWorkouts = await WorkoutSession.find({ user: req.user.id, is_active: false })
    .sort({ completed_at: -1 })
    .limit(5);
    
  res.json({ activeWorkout, recentWorkouts });
});

// Start Workout
router.post('/start', auth, async (req, res) => {
  const workout = await WorkoutSession.create({
    user: req.user.id,
    name: req.body.name,
    is_active: true
  });
  res.json(workout);
});

// Get Specific Workout Details
router.get('/:id', auth, async (req, res) => {
  const session = await WorkoutSession.findById(req.params.id);
  if (!session) return res.status(404).json({ error: 'Not found' });

  // Get Exercises
  const workoutExercises = await WorkoutExercise.find({ workout_session: session._id }).sort({ order_index: 1 });
  
  // Attach Sets to Exercises
  const exercisesWithSets = await Promise.all(workoutExercises.map(async (ex) => {
    const sets = await ExerciseSet.find({ workout_exercise: ex._id }).sort({ set_number: 1 });
    return { ...ex.toObject(), sets };
  }));

  res.json({ session, exercises: exercisesWithSets });
});

// Add Exercise to Workout
router.post('/:id/exercises', auth, async (req, res) => {
  const count = await WorkoutExercise.countDocuments({ workout_session: req.params.id });
  const exercise = await WorkoutExercise.create({
    workout_session: req.params.id,
    exercise_name: req.body.name,
    muscle_group: req.body.muscle_group,
    order_index: count
  });
  // Add first set
  await ExerciseSet.create({ workout_exercise: exercise._id, set_number: 1 });
  res.json(exercise);
});

// Add Set
router.post('/exercises/:id/sets', auth, async (req, res) => {
  const set = await ExerciseSet.create({
    workout_exercise: req.params.id,
    set_number: req.body.set_number
  });
  res.json(set);
});

// Update Set (Weight/Reps/Completion)
router.put('/sets/:id', auth, async (req, res) => {
  const set = await ExerciseSet.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(set);
});

// Delete Set
router.delete('/sets/:id', auth, async (req, res) => {
  await ExerciseSet.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Finish Workout
router.put('/:id/finish', auth, async (req, res) => {
  const workout = await WorkoutSession.findByIdAndUpdate(req.params.id, {
    is_active: false,
    completed_at: new Date(),
    duration_minutes: req.body.duration_minutes,
    name: req.body.name
  }, { new: true });
  res.json(workout);
});

module.exports = router;