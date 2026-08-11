const Vehicle = require("../models/vehicle.js");
const cloudinary = require('../config/cloudinary.js')

const uploadImage = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "gearhead_vehicles",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      },
    );

    uploadStream.end(fileBuffer);
  });
};


const create = async (req, res) => {
  try {

    if (req.file) {
      const uploadedImage = await uploadImage(req.file.buffer);

      req.body.image = {
        url: uploadedImage.secure_url,
        publicId: uploadedImage.public_id
      };
    }

    req.body.owner = req.user._id;

    const vehicle = await Vehicle.create(req.body);

    vehicle._doc.owner = req.user;

    res.status(201).json(vehicle);
  } catch (err) {
    console.log(err);
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

const update = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.vehicleId);

    if (!vehicle) {
      return res.status(404).json({ err: "Vehicle not found" });
    }

    if (!vehicle.owner.equals(req.user._id)) {
      return res.status(403).send("Only the owner can edit this vehicle!");
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.vehicleId,
      req.body,
      // { new: true }
      { returnDocument: 'after' }
      //SINCE I GET THIS WARINING:
      // (node:16256) [MONGOOSE] Warning: mongoose: the `new` option for `findOneAndUpdate()` and `findOneAndReplace()` is deprecated. Use `returnDocument: 'after'` instead.
      // (Use `node --trace-warnings ...` to show where the warning was created)    
    )

    updatedVehicle._doc.owner = req.user;

    res.status(200).json(updatedVehicle);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.vehicleId);

    if (!vehicle) {
      return res.status(404).json({ err: "Vehicle not found" });
    }

    if (!vehicle.owner.equals(req.user._id)) {
      return res.status(403).send("Only the owner can delete this vehicle!");
    }

    const deletedVehicle = await Vehicle.findByIdAndDelete(req.params.vehicleId);
    res.status(200).json(deletedVehicle);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

module.exports = {
  create,
  index,
  show,
  update,
  deleteVehicle,
};