const mongoose = require('mongoose');

const { Schema } = mongoose;

const reviews = new Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  dealership: { type: Number, required: true },
  review: { type: String, required: true },
  purchase: { type: Boolean },
  purchase_date: { type: String },
  car_make: { type: String },
  car_model: { type: String },
  car_year: { type: Number }
});

module.exports = mongoose.model('reviews', reviews);
