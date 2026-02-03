const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Exercise = require('../models/Exercise');

// Get all available exercises (Library)
router.get('/', auth, async (req, res) => {
  let exercises = await Exercise.find().sort({ name: 1 });
  
  // Seed if empty
  if (exercises.length === 0) {
    exercises = await Exercise.insertMany([
      { name: "Push Up", muscle_group: "Chest", equipment: "Bodyweight" },
      { name: "Bench Press", muscle_group: "Chest", equipment: "Barbell" },
      { name: "Squat", muscle_group: "Legs", equipment: "Barbell" },
      { name: "Deadlift", muscle_group: "Back", equipment: "Barbell" },
      { name: "Pull Up", muscle_group: "Back", equipment: "Bodyweight" },
      { name: "Plank", muscle_group: "Core", equipment: "Bodyweight" }
    ]);
  }
  
  res.json(exercises);
});

module.exports = router;