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
      Comment.find({ homestay_id }).populate('user_id').populate('order_id'),
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
exports.getAll = base.getAll(Comment);
exports.getComment = base.getOne(Comment);
exports.addCommentInHomestay = async (req, res, next) => {
  try {
    const body = req.body;
    const { user_id, text, rate, homestay_id, order_id } = body;
    const galleryFiles = req?.files?.images;
    let gallery = undefined;
    // gallery upload
    if (galleryFiles) {
      gallery = galleryFiles.map((file) => file.path);
      body.images = gallery;
    }
    // end upload image
    const payload = {
      user_id,
      text,
      rate,
      homestay_id,
      order_id,
    };
    if (gallery) {
      payload.images = gallery;
    }
    const comment = new Comment(payload);
    await comment.save();
    const homestay = await Homestay.findOne({ _id: homestay_id });
    const { rate: rateHomestay, comments_count } = homestay;
    const average =
      (parseInt(rate) + rateHomestay * comments_count) / (comments_count + 1);
    const dataUpdate = await Homestay.findByIdAndUpdate(
      homestay_id,
      { rate: average, $inc: { comments_count: 1 } },
      { new: true }
    );
    res.status(201).json({
      status: 'success',
      data: comment,
      dataHomestayUpdate: dataUpdate,
    });
  } catch (error) {
    next(error);
  }
};
// Don't update password on this
exports.updateComment = base.updateOne(Comment);
exports.deleteComment = base.deleteOne(Comment);
