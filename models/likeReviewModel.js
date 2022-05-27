const mongoose = require('mongoose');
const likeReviewSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    review_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'review',
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const LikeReview = mongoose.model('likeReview', likeReviewSchema);
module.exports = LikeReview;
