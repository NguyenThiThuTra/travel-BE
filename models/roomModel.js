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
    capacity: Number,
    status: {
      type: Boolean,
      default: true,
    },
    // assets: {
    //   macLab: { type: Boolean, default: false },
    //   pcLab: { type: Boolean, default: false },
    //   projector: { type: Boolean, default: false },
    //   tv: { type: Boolean, default: false },
    //   opWalls: { type: Boolean, default: false },
    //   whiteBoard: { type: Boolean, default: false },
    // },
  },
  { timestamps: true }
);

const Room = mongoose.model('room', roomSchema);
module.exports = Room;
