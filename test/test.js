const mongoose = require('mongoose');
const validator = require('validator');
const testSchema = new mongoose.Schema(
  {
    avatar: {
      type: Object,
      required: false,
    },
  },
  { timestamps: true }
);

const Test = mongoose.model('test', testSchema);
module.exports = Test;
