const Comment = require('../models/commentModel');
const Review = require('../models/reviewModel');
const LikeReview = require('../models/likeReviewModel');
const Order = require('../models/orderModel');
const Homestay = require('../models/homestayModel');
const APIFeatures = require('../utils/apiFeatures');
const base = require('./baseController');
const querystring = require('querystring');

exports.postReview = base.createOne(Review);
exports.getAllReview = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const query_filters = req.query.filters
      ? querystring.parse(req.query.filters)
      : {};

    // aggregate
    const provinceCode = query_filters?.province;

    const queryReview = [
      {
        $match: {
          province: Number(provinceCode),
        },
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'user_id',
          foreignField: 'user_id',
          pipeline: [
            {
              $group: {
                _id: '$homestay_id',
              },
            },
            {
              $lookup: {
                from: 'homestays',
                localField: '_id',
                foreignField: '_id',
                as: 'homestays',
              },
            },
            {
              $unwind: {
                path: '$homestays',
              },
            },
            {
              $match: {
                'homestays.addresses.province.code': Number(provinceCode),
              },
            },
          ],
          as: 'orders',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ];

    const featuresReview = new APIFeatures(
      Review.aggregate(queryReview),
      req.query
    )
      .paginate()
      .limitFields();
    const reviews = await featuresReview.query;

    const formatDataReviews = reviews.map((review) => {
      const homestays = review.orders.map((order) => order.homestays);
      const formatReview = { ...review, orders: { homestays } };
      return formatReview;
    });

    const passing_scores = await Review.aggregate([
      ...queryReview,
      {
        $count: 'passing_scores',
      },
    ]);
    const total = passing_scores?.[0].passing_scores;

    await res.status(200).json({
      status: 'success',
      results: formatDataReviews.length,
      data: formatDataReviews,
      paging: {
        current_page: page,
        total: total,
        per_page: limit,
        last_page: Math.ceil(total / limit),
        from: (page - 1) * limit + 1,
        to: (page - 1) * limit + 1 + limit,
        offset: (page - 1) * limit,
      },
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllReviewProvince = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const features = new APIFeatures(
      Review.find(
        req.query.filters ? querystring.parse(req.query.filters) : {}
      ).populate('user_id'),
      req.query
    )

      .sort()
      .paginate()
      .limitFields()
      .search();
    const doc = await features.query;

    await Review.countDocuments(
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

exports.getAllReviewDestination = async (req, res, next) => {
  try {
    const reviews = await Review.find().distinct('province');
    res.status(200).json({
      status: 'success',
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};
exports.getReview = async (req, res, next) => {
  try {
    const doc = await Review.findById(req.params.id).populate('user_id');

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

exports.updateReview = base.updateOne(Review);
exports.deleteReview = base.deleteOne(Review);

exports.likeReview = async (req, res, next) => {
  const { user_id, review_id } = req.body;
  try {
    // find review by review_id
    const doc = await Review.findById(review_id);
    if (!doc) {
      return next(
        new AppError(404, 'fail', 'No document found with that id'),
        req,
        res,
        next
      );
    }

    // find like review by user_id and review_id
    const likeReview = await LikeReview.findOneAndUpdate(
      {
        user_id,
        review_id,
        active: true,
      },
      {
        $set: {
          active: false,
        },
      }
    );

    if (likeReview) {
      const dataUpdate = await Review.findByIdAndUpdate(
        review_id,
        { $inc: { likeReview: -1 } },
        { new: true }
      );
      res.status(200).json({
        status: 'success',
        code: 200,
        data: dataUpdate,
      });
    } else {
      // update increment likeReview
      const dataUpdate = await Review.findByIdAndUpdate(
        review_id,
        { $inc: { likeReview: 1 } },
        { new: true }
      );
      const like = new LikeReview({ user_id, review_id });
      await like.save();
      res.status(200).json({
        status: 'success',
        code: 200,
        data: dataUpdate,
      });
    }
    // create like review
  } catch (error) {
    next(error);
  }
};
