const Comment = require('../models/commentModel');
const Review = require('../models/reviewModel');
const LikeReview = require('../models/likeReviewModel');
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
    console.log({ reviews });
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
      await Review.findByIdAndUpdate(
        review_id,
        { $inc: { likeReview: -1 } },
        { new: true }
      );
      res.status(200).json({
        status: 'success',
        code: 200,
      });
    } else {
      // update increment likeReview
      await Review.findByIdAndUpdate(
        review_id,
        { $inc: { likeReview: 1 } },
        { new: true }
      );
      const like = new LikeReview({ user_id, review_id });
      await like.save();
      res.status(200).json({
        status: 'success',
        code: 200,
      });
    }
    // create like review
  } catch (error) {
    next(error);
  }
};
