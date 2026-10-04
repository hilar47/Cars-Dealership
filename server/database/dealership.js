const mongoose = require('mongoose');

const { Schema } = mongoose;

const dealerships = new Schema({
  id: { type: Number, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  st: { type: String, required: true },
  address: { type: String, required: true },
  zip: { type: String, required: true },
  lat: { type: String },
  long: { type: String },
  short_name: { type: String },
  full_name: { type: String }
});

module.exports = mongoose.model('dealerships', dealerships);
