const Order = require('../models/orderModel');
const APIFeatures = require('../utils/apiFeatures');
const Room = require('../models/roomModel');
const Homestay = require('../models/homestayModel');
const base = require('./baseController');
const moment = require('moment');
const AppError = require('../utils/appError');
const querystring = require('querystring');

exports.getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    let query_filters = req.query.filters
      ? querystring.parse(req.query.filters)
      : {};
    let { status, ...rest } = query_filters;
    if (status && !Array.isArray(status)) {
      rest = { ...rest, status };
    }
    if (status && Array.isArray(status) && status?.length > 0) {
      const convertStatus = status?.map((s) => ({ status: s }));
      rest = { ...rest, $or: convertStatus };
    }
    const features = new APIFeatures(
      Order.find({ ...rest })
        .populate('room_ids')
        .populate('order.category_id')
        .populate('homestay_id'),
      req.query
    )
      .sort()
      .paginate()
      .limitFields();
    const doc = await features.query;

    await Order.countDocuments(
      req.query.filters ? querystring.parse(req.query.filters) : {}
    ).then((total) => {
      res.status(200).json({
        status: 'success',
        results: doc.length,
        data: doc,
        paging: {
          current_page: page,
          total: total,
          per_page: limit,
          last_page: Math.ceil(total / limit),
          from: (page - 1) * limit + 1,
          to: (page - 1) * limit + 1 + limit,
          offset: (page - 1) * limit,
        },
      });
    });
  } catch (error) {
    next(error);
  }
};
exports.getOrder = async (req, res, next) => {
  try {
    const doc = await Order.findById(req.params.id)
      .populate('room_ids')
      .populate('order.category_id')
      .populate('homestay_id');

    if (!doc) {
      return next(
        new AppError(404, 'fail', 'No document found with that id'),
        req,
        res,
        next
      );
    }

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};
exports.createOrder = async (req, res, next) => {
  try {
    let body = req.body;
    let query_filters = querystring.parse(req.query.filters) || {};
    const { from_date, to_date } = req.body;
    const start = from_date;
    const end = to_date;
    // get danh sách orders thoả mãn điều kiện thời gian
    const orders = await Order.find({
      $or: [
        { start: { $gte: from_date, $lt: to_date } },
        {
          end: { $gt: from_date, $lte: to_date },
        },
        {
          $and: [{ start: { $lte: from_date } }, { end: { $gte: to_date } }],
        },
      ],
      // filter by status order
      status: { $nin: ['rejected', 'canceled', 'holding'] },
    }).select('room_ids');
    // map thành mảng roomIds
    const roomIds = orders.map((b) => b.room_ids).flat();
    const order = body.order;
    // [ {category_id: 1, select_room: 2 }, {category_id: 2, select_room: 1 } ]
    // validate
    const room_ids = [];
    for (const item of order) {
      // Tìm các room thoả mãn điều kiện thời gian và category
      const room = await Room.find({
        _id: { $nin: roomIds },
        category_id: item.category_id,
      }).limit(item.select_room);

      // validate phòng trống ít hơn phòng đã đặt
      if (room.length < item.select_room) {
        return next(
          new AppError(
            404,
            'fail',
            `Not enough rooms for category ${item.category_id}`
          ),
          req,
          res,
          next
        );
      }
      // danh sách mảng room_id của các phòng đã đặt
      if (room.length >= item.select_room) {
        room_ids.push(...room.map((r) => r._id));
      }
    }
    // tạo đơn hàng
    const doc = new Order({ ...body, room_ids, start, end });
    await doc.save();
    console.log({ doc });

    res.status(201).json({
      code: 201,
      status: 'success',
      data: doc,
    });

    // end validate
  } catch (error) {
    next(error);
  }
};

// Don't update password on this
exports.updateOrder = async (req, res, next) => {
  try {
    const ORDER_STATUS = ['pending', 'approved', 'rejected', 'canceled'];
    const { status } = req.body;

    if (!ORDER_STATUS.includes(status)) {
      return next(
        new AppError(404, 'fail', 'No STATUS found with that id'),
        req,
        res,
        next
      );
    }

    const doc = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!doc) {
      return next(
        new AppError(404, 'fail', 'No document found with that id'),
        req,
        res,
        next
      );
    }
    res.status(200).json({
      status: 'success',
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};
exports.deleteOrder = base.deleteOne(Order);

exports.getDestinationOrderByUser = async function (req, res, next) {
  try {
    const user_id = req.params.user_id;
    const order = await Order.find({
      user_id,
      status: 'approved',
      start: { $lte: new Date() },
    })
      .distinct('homestay_id')
      .populate('homestay_id');

    if (!order) {
      return next(
        new AppError(404, 'fail', 'No document found with that id'),
        req,
        res,
        next
      );
    }
    const homestay = await Homestay.find({
      _id: {
        $in: order,
      },
    });

    res.status(200).json({
      status: 'success',
      data: homestay,
      order,
    });
  } catch (error) {
    next(error);
  }
};
