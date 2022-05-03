const User = require('../models/userModel');
const base = require('./baseController');
const AppError = require('../utils/appError');
exports.deleteMe = async (req, res, next) => {
  try {
    const doc = await User.findByIdAndUpdate(req.user.id, {
      active: false,
    });

    res.status(201).json({
      status: 'success',
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = base.getAll(User);
exports.getUser = base.getOne(User);

// Don't update password on this
exports.updateUser = base.updateOne(User);
exports.deleteUser = base.deleteOne(User);
