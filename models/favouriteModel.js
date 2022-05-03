const mongoose = require('mongoose');
const favouriteSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    room_ids: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'room',
      required: true,
    },
    homestay_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'homestay',
      required: true,
    },
    name_homestay: {
      type: String,
      required: true,
    },

    quantity_room: {
      type: Number,
      default: 1,
      required: true,
    },
  },
  { timestamps: true }
);

const Favourite = mongoose.model('favourite', favouriteSchema);
module.exports = Favourite;
