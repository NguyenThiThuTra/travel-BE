const Category = require('../models/categoryModel');
const Room = require('../models/roomModel');
const Order = require('../models/orderModel');
const Homestay = require('../models/homestayModel');
const APIFeatures = require('../utils/apiFeatures');
const querystring = require('querystring');
const base = require('./baseController');
const moment = require('moment');

exports.getAllCategory = base.getAll(Category);
exports.getCategory = base.getOne(Category);

exports.deleteCategory = base.deleteOne(Category);

exports.updateCategory = async (req, res, next) => {
  try {
    let body = req.body;
    // upload file
    // image upload
    const avatarFile = req?.files?.avatar?.[0];
    const galleryFiles = req?.files?.images;
    let avatar = undefined;
    let gallery = undefined;
    if (avatarFile) {
      avatar = avatarFile?.path;
      body.avatar = avatar;
    }
    // gallery upload
    if (galleryFiles) {
      gallery = galleryFiles.map((file) => file.path);
      body.images = gallery;
    }
    // end upload image

    const doc = await Category.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(
        new AppError(404, 'fail', 'No document found with that id'),
        req,
        res,
        next
      );
    }

    const homestay_id = body?.homestay_id;
    if (homestay_id) {
      const categoryMinPrice = await Category.find({
        homestay_id: homestay_id,
      })
        .limit(1)
        .sort('-price');
      const categoryMaxPrice = await Category.find({
        homestay_id: homestay_id,
      })
        .limit(1)
        .sort('-price');
      if (categoryMinPrice?.length > 0 && categoryMaxPrice?.length > 0) {
        await Homestay.findByIdAndUpdate(
          homestay_id,
          { minPrice: categoryMinPrice, maxPrice: categoryMaxPrice },
          {
            new: true,
            runValidators: true,
          }
        );
      }
    }

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};

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

exports.handleActiveCategory = async (req, res, next) => {
  try {
    let { active } = req.body;
    console.log({ active });
    const currentUser = req?.user;
    const filters = { _id: req.params.id };

    if (currentUser?.roles === 'user') {
      filters.user_id = currentUser?.id;
    }

    const doc = await Category.findOneAndUpdate(filters, { active });

    await Room.updateMany(
      { category_id: req.params.id },
      { $set: { status: active } },
      { multi: true }
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
