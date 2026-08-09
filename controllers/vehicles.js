// vehicle controller

const Vehicle = require("../models/vehicle.js");

const create = async (req, res) => {
  try {
    req.body.owner = req.user._id;
    const vehicle = await Vehicle.create(req.body);
    vehicle._doc.owner = req.user;
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

const index = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.user._id })
      .populate("owner")
      .sort({ editedAt: -1 });

    res.status(200).json(vehicles);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

const show = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.vehicleId)
      .populate(['owner', 'serviceRecords.owner']);

    if (!vehicle) {
      return res.status(404).json({ err: "Vehicle not found" });
    }

    if (!vehicle.owner._id.equals(req.user._id)) {
      return res.status(403).send("You're not authorized to view this vehicle!");
    }

    res.status(200).json(vehicle);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};



module.exports = {
  create,
  index,
  show,
}