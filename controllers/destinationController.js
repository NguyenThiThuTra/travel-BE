const Destination = require('../models/destinationModel');
const Homestay = require('../models/homestayModel');
const base = require('./baseController');
const AppError = require('../utils/appError');
exports.getAllDestinations = base.getAll(Destination);
exports.getDestination = base.getOne(Destination);
exports.updateDestinationOfHomestay = async (req, res) => {
  try {
    const filter = { homestay_id: { $in: [req.params.homestay_id] } };
    const destination = await Destination.findOne(filter);
    if (!destination) {
      return res.status(404).json({
        status: '404 Not Found',
        data: {
          updateDestination,
        },
      });
    }
    let homestay_id = await destination.homestay_id.filter(
      (id) => id != req.params.homestay_id
    );

    let updateDestination = await Destination.findOneAndUpdate(
      filter,
      { homestay_id },
      {
        new: true,
        upsert: true, // Make this update into an upsert
      }
    );

    res.status(201).json({
      status: 'success',
      data: {
        updateDestination,
      },
    });
  } catch (error) {
    next(error);
  }
};
exports.createDestination = base.createOne(Destination);
exports.addHomestayAndUpdateDestination = async (req, res) => {
  try {
    const body = req.body;
    const destination_info = {
      province: {
        code: body['destination.province.code'],
        name: body['destination.province.name'],
      },
    };
    const addresses = {
      address: body['homestay.addresses.address'],
      province: {
        code: body['homestay.addresses.province.code'],
        name: body['homestay.addresses.province.name'],
      },
      district: {
        code: body['homestay.addresses.district.code'],
        name: body['homestay.addresses.district.name'],
      },
      ward: {
        code: body['homestay.addresses.ward.code'],
        name: body['homestay.addresses.ward.name'],
      },
    };
    const name = body['homestay.name'];
    const user_id = body['homestay.user_id'];
    const description = body['homestay.description'];
    const homestay_info = {
      user_id,
      name,
      description,
      addresses,
    };
    // upload file
    // image upload
    const avatarFile = req?.files?.avatar?.[0];
    const galleryFiles = req?.files?.images;
    let avatar = undefined;
    let gallery = undefined;
    if (avatarFile) {
      avatar = avatarFile?.path;
      body.avatar = avatar;
    }
    // gallery upload
    if (galleryFiles) {
      gallery = galleryFiles.map((file) => file.path);
      homestay_info.images = gallery;
    }
    // end upload image

    const homestay = new Homestay(homestay_info);
    await homestay.save(async function (err, homestay) {
      if (err) return res.send(err);
      const findOneDestination = await Destination.findOne(
        { 'province.code': destination_info.province.code },
        function (err, destination) {
          if (err) return res.send(err);
          if (destination) {
            destination.homestay_id.push(homestay);
            destination.save(function (err) {
              if (err) return res.send(err);
              res.status(201).json({
                status: 'success',
                dataDestination: destination,
                dataHomestay: homestay,
              });
            });
          } else {
            const newDestination = new Destination(destination_info);
            newDestination.homestay_id.push(homestay);
            newDestination.save(function (err) {
              if (err) return res.send(err);
              res.status(201).json({
                status: 'success',
                dataDestination: newDestination,
                dataHomestay: homestay,
              });
            });
          }
        }
      );
    });
  } catch (error) {
    next(error);
  }
};
exports.getHomestayInDestination = async (req, res) => {
  const oneDestination = await Destination.findOne({
    _id: req.params.id,
  })
    .populate('homestay_id')
    .exec()
    .then((homestay) => {
      res.status(201).json({
        status: 'success',
        data: homestay,
      });
    });
};

// Don't update password on this
exports.updateDestination = base.updateOne(Destination);
exports.deleteDestination = base.deleteOne(Destination);
