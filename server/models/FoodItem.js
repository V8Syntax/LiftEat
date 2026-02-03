const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  name: String,
  calories_per_100g: Number,
  protein_per_100g: Number,
  carbs_per_100g: Number,
  fat_per_100g: Number
});

module.exports = mongoose.model('FoodItem', foodItemSchema);