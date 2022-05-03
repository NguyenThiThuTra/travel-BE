const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema(
  {
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
    description: {
      type: String,
      required: false,
      default: '',
    },
    images: {
      type: Array,
      required: false,
      default: [],
    },
    avatar: {
      type: String,
    },
  },
  { timestamps: true }
);

const Destination = mongoose.model('destination', destinationSchema);
module.exports = Destination;
