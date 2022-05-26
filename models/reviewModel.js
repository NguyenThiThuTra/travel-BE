const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
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
      type: mongoose.Schema.Types.Mixed,
      required: false,
      default: null,
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
