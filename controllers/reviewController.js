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
    let dataReview = doc;
    // asyncOrderByUserIdReview
    const asyncOrderByUserIdReview = async (review) => {
      const homestayIds = await Order.find({
        user_id: review.user_id,
        status: 'approved',
      }).distinct('homestay_id');
      const homestays = await Homestay.find({ _id: { $in: homestayIds } });
      return { [review?._id]: homestays };
    };
    const orderByUserIdReview = await Promise.all(
      doc.map((value) => asyncOrderByUserIdReview(value))
    );
    dataReview = doc.map((item) => {
      const homestays = orderByUserIdReview.find((l) => {
        if (Object.keys(l)?.[0] == item?._id.toString()) {
          return l;
        }
        return false;
      });

      return {
        ...item?._doc,
        homestays: Object.values(homestays)?.[0],
      };
    });
    // asyncReview
    const currentUser = req?.user;
    let dataLike = [];

    if (currentUser) {
      const asyncReview = async (review) => {
        let isCurrentUserLike = false;
        try {
          const data = await LikeReview.findOne({
            user_id: currentUser._id,
            review_id: review?._id,
            active: true,
          });
          if (data) {
            isCurrentUserLike = true;
          }
        } catch (error) {
          isCurrentUserLike = false;
        }
        dataLike.push({ [review?._id]: isCurrentUserLike });
      };
      await Promise.all(dataReview.map((value) => asyncReview(value)));

      dataReview = dataReview.map((item) => {
        const isCheckLike = dataLike.find((l) => {
          if (Object.keys(l)?.[0] == item?._id.toString()) {
            return l;
          }
          return false;
        });

        return {
          ...item,
          isCurrentUserLike: Object.values(isCheckLike)?.[0],
        };
      });
    }

    // aggregate
    // const reviews = await Review.aggregate([
    //   {
    //     $match: {
    //       province: 1,
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: 'orders',
    //       localField: 'user_id',
    //       foreignField: 'user_id',
    //       pipeline: [
    //         {
    //           $group: {
    //             _id: '$homestay_id',
    //           },
    //         },
    //         {
    //           $lookup: {
    //             from: 'homestays',
    //             localField: '_id',
    //             foreignField: '_id',
    //             as: 'homestays',
    //           },
    //         },
    //         {
    //           $unwind: {
    //             path: '$homestays',
    //           },
    //         },
    //       ],
    //       as: 'orders',
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: 'users',
    //       localField: 'user_id',
    //       foreignField: '_id',
    //       as: 'user',
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: '$user',
    //     },
    //   },
    //   {
    //     $sort: {
    //       createdAt: -1,
    //     },
    //   },
    // ]);

    await Review.countDocuments(
      req.query.filters ? querystring.parse(req.query.filters) : {}
    ).then((total) => {
      res.status(200).json({
        status: 'success',
        results: doc.length,
        data: dataReview,
        paging: {
          current_page: page,
          total: total,
          per_page: limit,
          last_page: Math.ceil(total / limit),
          from: (page - 1) * limit + 1,
          to: (page - 1) * limit + 1 + limit,
          offset: (page - 1) * limit,
        },
        // reviews,
      });
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
    // update increment likeReview
    // const a = await Review.findByIdAndUpdate(
    //   review_id,
    //   { $inc: { likeReview: 1 } },
    //   { new: true }
    // );

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
