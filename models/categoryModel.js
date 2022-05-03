const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: [true, 'Please fill room name'],
    },
    description: {
      type: String,
      required: true,
    },
    images: {
      type: Array,
      required: false,
      default: [],
    },
    avatar: {
      type: String,
    },
    type: {
      type: String,
      enum: ['single', 'double', 'family', 'big family'],
      default: 'double',
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    comments_count: {
      type: Number,
      default: 0,
    },
    rate: {
      type: Number,
      default: 0,
    },
    view: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Category = mongoose.model('category', categorySchema);
module.exports = Category;
