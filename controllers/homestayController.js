const Homestay = require('../models/homestayModel');
const base = require('./baseController');
const Order = require('../models/orderModel');
const Room = require('../models/roomModel');
const querystring = require('querystring');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

exports.getAllHomestay = base.getAll(Homestay);
exports.getAllHomestaySearch = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    let query_filters = querystring.parse(req.query?.filters) || {};
    let merge_query = Object.assign({}, query_filters);

    const { from_date, to_date, province_code } = req.query;
    if (from_date && to_date) {
      // console.log({ from_date, to_date });
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
      }).select(['room_ids', 'homestay_id']);
      // const homestayIds = orders.map((b) => b.homestay_id);
      const roomIds = orders.map((b) => b.room_ids).flat();
      merge_query = {
        ...merge_query,
        _id: { $nin: roomIds },
      };

      const availableRoom = await Room.find(merge_query).distinct(
        'homestay_id'
      );
      merge_query = {
        ...merge_query,
        _id: { $in: availableRoom },
      };
    }
    if (province_code) {
      merge_query = {
        ...merge_query,
        'addresses.province.code': province_code,
      };
    }

    const features = new APIFeatures(Homestay.find(merge_query), req.query)
      .search()
      .sort()
      .paginate()
      .limitFields();
    const availableRooms = await features.query;

    await Homestay.countDocuments(merge_query).then((total) => {
      res.status(200).json({
        status: 'success',
        results: availableRooms.length,
        data: availableRooms,
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

    res.status(200).json({
      status: 'success',
      results: availableRooms.length,
      data: availableRooms,
    });
  } catch (error) {
    next(error);
  }
};

exports.getHomestay = base.getOne(Homestay);
exports.createHomestay = async (req, res, next) => {
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

    const { user_id } = body;
    const homestayByUserId = await Homestay.findOne({ user_id });

    if (homestayByUserId) {
      return next(
        new AppError(400, 'fail', 'Bạn đã tạo homestay rồi'),
        req,
        res,
        next
      );
    }

    const doc = new Homestay(body);
    await doc.save();

    res.status(201).json({
      status: 'success',
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};
exports.updateHomestay = base.updateOne(Homestay);
exports.deleteHomestay = base.deleteOne(Homestay);
