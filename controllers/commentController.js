const Comment = require('../models/commentModel');
const Homestay = require('../models/homestayModel');
const APIFeatures = require('../utils/apiFeatures');
const base = require('./baseController');
exports.getAllCommentInHomestay = async (req, res, next) => {
  try {
    const { homestay_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const features = new APIFeatures(
      Comment.find({ homestay_id }).populate('user_id'),
      req.query
    )
      .sort()
      .paginate()
      .limitFields();
    const doc = await features.query;

    await Comment.countDocuments({}).then((total) => {
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
exports.getComment = base.getOne(Comment);
exports.addCommentInHomestay = async (req, res, next) => {
  try {
    const body = req.body;
    const { user_id, text, homestay_id } = body;
    const comment = new Comment({
      user_id,
      text,
      homestay_id,
    });
    await comment.save();
  } catch (error) {
    next(error);
  }
};
// Don't update password on this
exports.updateComment = base.updateOne(Comment);
exports.deleteComment = base.deleteOne(Comment);
