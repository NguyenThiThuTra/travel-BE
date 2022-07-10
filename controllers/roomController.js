const Room = require('../models/roomModel');
const Homestay = require('../models/homestayModel');
const Category = require('../models/categoryModel');
const Order = require('../models/orderModel');
const base = require('./baseController');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const querystring = require('querystring');
const moment = require('moment');

exports.getRoom = async (req, res, next) => {
  try {
    const doc = await Room.findById(req.params.id)
      .populate('homestay_id')
      .populate('category_id');

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
exports.createRoom = async (req, res, next) => {
  try {
    const body = req.body;
    const { homestay_id, name, description, type, quantity, price, user_id } =
      body;
    const discount = body?.discount || 0;
    const rate = body?.rate || 0;
    const view = body?.view || 0;
    const comments_count = body?.comments_count || 0;
    const categoryData = {
      homestay_id,
      name,
      type,
      quantity,
      price,
      description,
      discount,
      rate,
      view,
      comments_count,
      user_id,
    };

    // upload file
    // image upload
    const avatarFile = req?.files?.avatar?.[0];
    const galleryFiles = req?.files?.images;
    let avatar = undefined;
    let gallery = undefined;
    if (avatarFile) {
      avatar = avatarFile?.path;
      categoryData.avatar = avatar;
    }
    // gallery upload
    if (galleryFiles) {
      gallery = galleryFiles.map((file) => file.path);
      categoryData.images = gallery;
    }
    // end upload image

    const category = new Category(categoryData);
    await category.save();
    const roomData = {
      homestay_id,
      category_id: category._id,
      user_id,
    };
    //  roomData to array rooms
    const rooms = [];
    for (let i = 0; i < quantity; i++) {
      rooms.push(new Room(roomData));
    }

    // tạo nhiều room cùng một category

    const doc = await Room.insertMany(rooms);
    res.status(201).json({
      code: 201,
      status: 'success',
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};
exports.updateRoom = base.updateOne(Room);
exports.deleteRoom = base.deleteOne(Room);

exports.getAllRooms = async (req, res, next) => {
  try {
    let query_filters = querystring.parse(req.query?.filters) || {};
    let merge_query = Object.assign({}, query_filters);
    const { from_date, to_date } = req.query;
    if (from_date && to_date) {
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
      const roomIds = orders.map((b) => b.room_ids).flat();
      merge_query = {
        ...merge_query,
        _id: { $nin: roomIds },
      };
    }

    const { activeCategory } = req.query;
    if (activeCategory !== undefined) {
      merge_query = {
        ...merge_query,
        status: activeCategory,
      };
    }

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
