const mongoose = require('mongoose');

const homestaySchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please fill your name'],
    },
    description: {
      type: String,
    },
    addresses: {
      address: {
        type: String,
        required: true,
      },
      province: {
        name: {
          type: String,
          required: true,
        },
        code: {
          type: Number,
          required: true,
        },
      },
      district: {
        name: {
          type: String,
          required: true,
        },
        code: {
          type: Number,
          required: true,
        },
      },
      ward: {
        name: {
          type: String,
          required: true,
        },
        code: {
          type: Number,
          required: true,
        },
      },
    },
    images: {
      type: Array,
      default: [],
    },
    avatar: {
      type: String,
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
    active: {
      type: Boolean,
      default: true,
    },
    minPrice: {
      type: Number,
      default: 0,
    },
    maxPrice: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

homestaySchema.index({
  name: 'text',
  // description: 'text',
});

const Homestay = mongoose.model('homestay', homestaySchema);
Homestay.createIndexes({
  name: 'text',
});
module.exports = Homestay;
