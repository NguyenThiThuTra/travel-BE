const Location = require("../models/locationModel");
const base = require('./baseController');
exports.getAllLocations = base.getAll(Location);
exports.getLocation = base.getOne(Location);
exports.createLocation = base.createOne(Location);
// Don't update password on this
exports.updateLocation = base.updateOne(Location);
exports.deleteLocation = base.deleteOne(Location);