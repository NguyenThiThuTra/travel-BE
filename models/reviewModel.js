const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: false,
    },
    province: {
      type: Number,
      required: true,
    },
    review: {
      type: String,
      required: true,
    },
    images: {
      type: Array,
      default: [],
    },
    schedule: {
      type: [
        {
          type: String,
          required: false,
        },
      ],
      required: false,
      default: [],
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Review = mongoose.model('review', reviewSchema);
module.exports = Review;
