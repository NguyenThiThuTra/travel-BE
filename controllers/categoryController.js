const Category = require('../models/categoryModel');
const Room = require('../models/roomModel');
const Order = require('../models/orderModel');
const APIFeatures = require('../utils/apiFeatures');
const querystring = require('querystring');
const base = require('./baseController');
const moment = require('moment');

exports.getAllCategory = base.getAll(Category);
exports.getCategory = base.getOne(Category);
exports.updateCategory = base.updateOne(Category);
exports.deleteCategory = base.deleteOne(Category);

exports.getAllCategoryInHomestay = async (req, res, next) => {
  try {
    let body = req.body;
    let query_filters = querystring.parse(req.query.filters) || {};
    const { from_date, to_date } = req.query;
    const orders = await Order.find({
      $or: [
        { start: { $gte: from_date, $lte: to_date } },
        {
          end: { $gte: from_date, $lte: to_date },
        },
        {
          $and: [{ start: { $lte: from_date } }, { end: { $gte: to_date } }],
        },
      ],
      // filter by status order
      status: { $nin: ['rejected', 'canceled'] },
    }).select('room_ids');

    const order = body.order;
    // [ {category_id: 1, select_room: 2 }, {category_id: 2, select_room: 1 } ]

    const roomIds = orders.map((b) => b.room_ids).flat();
    let merge_query = Object.assign({}, query_filters);
    merge_query = Object.assign({}, query_filters, { _id: { $nin: roomIds } });
    const features = new APIFeatures(
      Room.find(merge_query).populate('homestay_id').populate('category_id'),
      req.query
    )
      .sort()
      .paginate()
      .limitFields();
    const availableRooms = await features.query;
    res.status(200).json({
      status: 'success',
      results: availableRooms.length,
      data: availableRooms,
    });
  } catch (error) {
    next(error);
  }
};
