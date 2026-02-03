const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: String,
  muscle_group: String,
  equipment: String
});

module.exports = mongoose.model('Exercise', exerciseSchema);