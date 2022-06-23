const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
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
    rate: {
      type: Number,
      default: 0,
    },
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'order',
      required: true,
    },
    images: {
      type: Array,
      default: [],
    },
    text: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    replies: [
      {
        type: new mongoose.Schema(
          {
            text: String,
            active: {
              type: Boolean,
              default: true,
            },
          },
          { timestamps: true }
        ),
      },
    ],
  },
  { timestamps: true }
);

const Comment = mongoose.model('comment', commentSchema);
module.exports = Comment;
