const LikeReview = require('../models/likeReviewModel');
const base = require('./baseController');

exports.getAllLikeReview = base.getAll(LikeReview);
exports.getLikeReview = base.getOne(LikeReview);
exports.updateLikeReview = base.updateOne(LikeReview);
exports.deleteLikeReview = base.deleteOne(LikeReview);
exports.getLikeReviewByUserId = async (req, res, next) => {
  const { user_id, review_id } = req.body;
  try {
    const likeReview = await LikeReview.findOne({
      user_id,
      review_id,
      active: true,
    });
    res.status(200).json({
      status: 'success',
      data: likeReview,
    });
  } catch (err) {
    next(err);
  }
};
