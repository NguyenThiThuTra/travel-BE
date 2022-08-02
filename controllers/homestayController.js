const Homestay = require('../models/homestayModel');
const base = require('./baseController');
const Order = require('../models/orderModel');
const Category = require('../models/categoryModel');
const Room = require('../models/roomModel');
const querystring = require('querystring');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const mongoose = require('mongoose');

exports.getAllHomestay = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const features = new APIFeatures(
      Homestay.find(
        req.query.filters ? querystring.parse(req.query.filters) : {}
      ).populate('user_id'),
      req.query
    )
      .sort()
      .paginate()
      .limitFields()
      .search();
    const doc = await features.query;

    await Homestay.countDocuments(
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
exports.getAllHomestaySearch = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;

    let { active, ...query_filters } =
      querystring.parse(req.query?.filters) || {};
    let merge_query = Object.assign({}, query_filters);

    const { from_date, to_date, province_code } = req.query;

    let distinctHomestayId = null;
    if (from_date && to_date) {
      // console.log({ from_date, to_date });
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
      }).select(['room_ids', 'homestay_id']);
      // const homestayIds = orders.map((b) => b.homestay_id);
      const roomIds = orders.map((b) => b.room_ids).flat();
      merge_query = {
        ...merge_query,
        _id: { $nin: roomIds },
      };

      const { activeCategory } = req.query;
      let queryRooms = { ...merge_query };
      if (activeCategory !== undefined) {
        queryRooms = {
          ...queryRooms,
          status: activeCategory,
        };
      }

      distinctHomestayId = await Room.find(queryRooms).distinct('homestay_id');
      merge_query = {
        ...merge_query,
        _id: { $in: distinctHomestayId },
      };
    }
    if (province_code) {
      merge_query = {
        ...merge_query,
        'addresses.province.code': province_code,
      };
    }

    const filtersHomestay = { ...merge_query };
    if (typeof active !== 'undefined') {
      filtersHomestay.active = active;
    }

    // query homestay
    let queryHomestay = {};

    const queryCategory = [
      {
        $match: { active: true },
      },
      {
        $group: {
          _id: { homestay_id: '$homestay_id' },
          minPrice: { $min: '$price' },
        },
      },
      {
        $lookup: {
          from: 'homestays',
          localField: '_id.homestay_id',
          foreignField: '_id',
          as: 'homestay',
        },
      },
      {
        $unwind: { path: '$homestay' },
      },
    ];

    const searchText = req.query?.search;
    // console.log({ searchText });
    if (searchText) {
      queryHomestay = {
        ...queryHomestay,
        'homestay.name': new RegExp(searchText, 'i'),
      };
    }

    const { activeCategory } = req.query;
    if (activeCategory !== undefined) {
      queryHomestay = {
        ...queryHomestay,
        'homestay.active': activeCategory === 'true' || activeCategory === true,
      };
    }

    if (province_code) {
      queryHomestay = {
        ...queryHomestay,
        'homestay.addresses.province.code': parseInt(province_code),
      };
    }

    if (distinctHomestayId) {
      const or = distinctHomestayId.map((item) => {
        return { 'homestay._id': new mongoose.Types.ObjectId(item) };
      });
      queryHomestay = { ...queryHomestay, $or: or };
    }

    const matchQueryHomestay = {
      $match: queryHomestay,
    };
    const isCheckExistQueryHomestay = Object.values(queryHomestay).length > 0;

    if (isCheckExistQueryHomestay) {
      queryCategory.push(matchQueryHomestay);
    }

    // handle sort
    const sort = req.query.sort;
    let querySort = {};
    if (sort) {
      if (sort === 'rate') {
        querySort = {
          $sort: {
            'homestay.rate': 1,
          },
        };
      }
      if (sort === '-rate') {
        querySort = {
          $sort: {
            'homestay.rate': -1,
          },
        };
      }
      if (sort === 'minPrice') {
        querySort = {
          $sort: {
            minPrice: 1,
          },
        };
      }
      if (sort === '-minPrice') {
        querySort = {
          $sort: {
            minPrice: -1,
          },
        };
      }
    }
    querySort = {
      $sort: { ...querySort.$sort, 'homestay._id': 1 },
    };

    queryCategory.push(querySort);

    // end handle sort

    const features = new APIFeatures(
      Category.aggregate(queryCategory),
      req.query
    )
      // .search()
      // .sort()
      .paginate()
      .limitFields();
    const availableRooms = await features.query;
    const homestays = availableRooms.map((value) => {
      const homestay = {
        ...value.homestay,
        minPrice: value.minPrice,
      };
      return homestay;
    });

    // const features1 = new APIFeatures(Homestay.find(filtersHomestay), req.query)
    //   .search()
    //   .sort()
    //   .paginate()
    //   .limitFields();
    // const availableRooms1 = await features1.query;
    // end query homestay
    const passing_scores = await Category.aggregate([
      ...queryCategory,
      {
        $count: 'passing_scores',
      },
    ]);
    const total = passing_scores?.[0]?.passing_scores;
    
    await res.status(200).json({
      status: 'success',
      results: homestays.length,
      data: homestays,
      paging: {
        current_page: page,
        total: total,
        per_page: limit,
        last_page: Math.ceil(total / limit),
        from: (page - 1) * limit + 1,
        to: (page - 1) * limit + 1 + limit,
        offset: (page - 1) * limit,
      },
      availableRooms,
      queryCategory,
      passing_scores,
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
exports.updateHomestay = async (req, res, next) => {
  try {
    let { active, ...body } = req.body;
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
    const doc = await Homestay.findByIdAndUpdate(req.params.id, body, {
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
    res.status(200).json({
      status: 'success',
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};
exports.handleActiveHomestay = async (req, res, next) => {
  try {
    let { active } = req.body;
    const currentUser = req?.user;
    const filters = { _id: req.params.id };

    if (currentUser?.roles === 'user') {
      filters.user_id = currentUser?.id;
    }

    const doc = await Homestay.findOneAndUpdate(filters, { active });

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
exports.deleteHomestay = base.deleteOne(Homestay);
