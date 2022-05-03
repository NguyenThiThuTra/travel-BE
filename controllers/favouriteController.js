const Favourite = require('../models/favouriteModel');
const Room = require('../models/roomModel');
const Homestay = require('../models/homestayModel');
const base = require('./baseController');

exports.getAllFavourite = base.getAll(Favourite);
exports.getFavourite = base.getOne(Favourite);
exports.createFavourite = async (req, res) => {
  const newFavourite = new Favourite(req.body);
  await newFavourite.save(async function (err, newFavourite) {
    res.status(201).json({
      status: 'success',
      data: newFavourite,
    });
  });
};
exports.deleteManyFavourite = async (req, res) => {
  await Favourite.deleteMany(req.body);
  res.status(201).json({
    status: 'success',
    body: req.body,
  });
};

exports.getRoomInFavourite = async (req, res) => {
  const favouriteUser = await Favourite.find({
    user_id: req.params.id,
  })
    .populate('room_ids')
    .exec()
    .then((favourite) => {
      res.status(201).json({
        status: 'success',
        data: favourite,
      });
    });
};
// Don't update password on this
exports.updateFavourite = base.updateOne(Favourite);
exports.deleteFavourite = base.deleteOne(Favourite);
