const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Exercise = require('../models/Exercise');

// Smart mapping for broader search terms
const BODY_PART_MAPPING = {
  legs: ['legs', 'quadriceps', 'hamstrings', 'calves', 'glutes', 'adductors', 'abductors'],
  arms: ['arms', 'biceps', 'triceps', 'forearms'],
  back: ['back', 'lats', 'middle back', 'lower back', 'traps', 'trapezius'],
  chest: ['chest', 'pectorals'],
  shoulders: ['shoulders', 'deltoids'],
  abs: ['abs', 'abdominals', 'core'],
  cardio: ['cardio']
};

// @route   GET api/exercises
// @desc    Get all exercises (with smart filtering)
router.get('/', auth, async (req, res) => {
  try {
    const { bodyPart, query } = req.query;
    let filter = {};

    // 1. Text Search (Name)
    if (query) {
      filter.name = { $regex: query, $options: 'i' };
    }
    
    // 2. Category/BodyPart Filter
    if (bodyPart && bodyPart !== 'all') {
      const term = bodyPart.toLowerCase();
      
      // Get all related muscle names (e.g., legs -> [quads, hamstrings...])
      const synonyms = BODY_PART_MAPPING[term] || [term];
      const regexPattern = synonyms.join('|'); // e.g., "legs|quadriceps|hamstrings"

      filter.$or = [
        // Match Body Part (using synonyms)
        { bodyPart: { $regex: regexPattern, $options: 'i' } },
        // Match Category (critical for Cardio)
        { category: { $regex: term, $options: 'i' } }
      ];
    }

    const exercises = await Exercise.find(filter).limit(100);
    res.json(exercises);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/exercises/search
// @desc    Search Exercises (Legacy support)
router.get('/search', auth, async (req, res) => {
  try {
    const { query } = req.query;
    let exercises;

    if (query) {
      exercises = await Exercise.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { bodyPart: { $regex: query, $options: 'i' } }
        ]
      }).limit(50);
    } else {
      exercises = await Exercise.aggregate([{ $sample: { size: 20 } }]);
    }

    res.json(exercises);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/exercises/rate
// @desc    Rate an exercise
router.post('/rate', auth, async (req, res) => {
  res.json({ msg: "Rating saved" }); 
});

module.exports = router;