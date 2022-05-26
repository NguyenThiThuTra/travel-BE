const Comment = require('../models/commentModel');
const Review = require('../models/reviewModel');
const Homestay = require('../models/homestayModel');
const APIFeatures = require('../utils/apiFeatures');
const base = require('./baseController');

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
