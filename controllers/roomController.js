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
        {
          minPrice: categoryMinPrice?.[0]?.price,
          maxPrice: categoryMaxPrice?.[0]?.price,
        },
        {
          new: true,
          runValidators: true,
        }
      );
    }

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
exports.updateRoom = async (req, res, next) => {
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

    const doc = await Room.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    });

    if (body?.category_id) {
      const doc = await Room.find({
        category_id: body?.category_id,
        status: true,
      }).limit(2);
      if (doc?.length === 1) {
        await Category.findByIdAndUpdate(
          body?.category_id,
          { active: true },
          {
            new: true,
            runValidators: true,
          }
        );
      }
      if (!doc.length) {
        await Category.findByIdAndUpdate(
          body?.category_id,
          { active: false },
          {
            new: true,
            runValidators: true,
          }
        );
      }
    }

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

exports.deleteRoom = base.deleteOne(Room);
