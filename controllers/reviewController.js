const Comment = require('../models/commentModel');
const Review = require('../models/reviewModel');
const Homestay = require('../models/homestayModel');
const APIFeatures = require('../utils/apiFeatures');
const base = require('./baseController');


exports.postReview = base.createOne(Review);
exports.getAllReview = base.getAll(Review);
exports.getReview = base.getOne(Review);

exports.updateReview = base.updateOne(Review);
exports.deleteReview = base.deleteOne(Review);
