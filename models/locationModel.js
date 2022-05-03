const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    destination: {
      type: String,
      required: [true, 'Please fill location name'],
    },
    rate: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Location = mongoose.model('location', locationSchema);
module.exports = Location;
