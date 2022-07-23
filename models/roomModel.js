const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    homestay_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'homestay',
      required: true,
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'category',
      required: true,
    },
    price: Number,
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Room = mongoose.model('room', roomSchema);
module.exports = Room;
