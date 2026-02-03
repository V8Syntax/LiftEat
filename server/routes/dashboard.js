const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const WorkoutSession = require('../models/WorkoutSession');
const WorkoutExercise = require('../models/WorkoutExercise');
const DietLog = require('../models/DietLog');

router.get('/stats', auth, async (req, res) => {
  // 1. Last Workout
  const lastWorkout = await WorkoutSession.findOne({ user: req.user.id, is_active: false })
    .sort({ completed_at: -1 });

  // 2. Exercise Count for Last Workout
  let lastWorkoutExerciseCount = 0;
  if (lastWorkout) {
    lastWorkoutExerciseCount = await WorkoutExercise.countDocuments({ workout_session: lastWorkout._id });
  }

  // 3. Today's Diet
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todaysDiet = await DietLog.find({ user: req.user.id, logged_at: { $gte: startOfDay } });

  // 4. Weekly Workout Count
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weeklyWorkoutCount = await WorkoutSession.countDocuments({
    user: req.user.id,
    is_active: false,
    completed_at: { $gte: oneWeekAgo }
  });

  res.json({
    lastWorkout,
    lastWorkoutExerciseCount,
    todaysDiet,
    weeklyWorkoutCount
  });
});

module.exports = router;