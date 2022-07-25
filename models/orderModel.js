const mongoose = require('mongoose');
const validator = require('validator');

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: false,
    },
    order: [
      {
        category_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'category',
          require: true,
        },
        select_room: {
          type: Number,
          require: true,
        },
      },
    ],
    room_ids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'room',
        required: true,
      },
    ],
    total_payment: {
      type: Number,
      require: true,
    },
    total_rooms: {
      type: Number,
      require: true,
    },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    homestay_name: {
      type: String,
      required: [false, 'Please fill your name'],
    },
    homestay_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'homestay',
      required: true,
    },
    name: {
      type: String,
      required: [false, 'Please fill your name'],
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      validate: [validator.isEmail, ' Please provide a valid email'],
    },
    phone_number: {
      required: true,
      type: String,
      required: [true, 'Please fill your phone'],
    },
    note: {
      type: String,
      required: false,
    },
    payment: {
      type: String,
      enum: ['Giao dịch trực tiếp', 'Momo', 'Ngân hàng', 'vnpay'],
      default: 'Giao dịch trực tiếp',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'canceled', 'holding'],
      default: 'pending',
    },
    paid: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model('order', orderSchema);
module.exports = Order;
