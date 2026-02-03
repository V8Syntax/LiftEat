const mongoose = require('mongoose');

const dietLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  food_name: String,
  quantity_g: Number,
  calories: Number,
  protein: Number,
  carbs: Number,
  fat: Number,
  meal_type: String,
  logged_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DietLog', dietLogSchema);