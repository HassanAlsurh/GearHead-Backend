const Vehicle = require("../models/vehicle.js");
const User = require("../models/user.js")
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

    // let invitedPerson 

    // if (req.body.invite) {

    //   const invitedUser = await User.find({username: req.body.invite})   
    //   console.log('invited person: >>>>', invitedUser);

    //   invitedPerson = invitedUser._id
    // }



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

    const oldPublicId = vehicle.image?.publicId;

    if (req.file) {
      const uploadedImage = await uploadImage(req.file.buffer);

      req.body.image = {
        url: uploadedImage.secure_url,
        publicId: uploadedImage.public_id
      };
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.vehicleId,
      req.body,
      { returnDocument: 'after' }
    )

    updatedVehicle._doc.owner = req.user;


    if (req.file && oldPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId, { invalidate: true });
      } catch (cloudinaryError) {
        console.error("Could not delete the old image:", cloudinaryError);
      }
    }

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

    if (vehicle.image?.publicId) {
      try {
        await cloudinary.uploader.destroy(vehicle.image.publicId, { invalidate: true });
      } catch (cloudinaryError) {
        console.error("Could not delete image from Cloudinary:", cloudinaryError);
      }
    }

    const deletedVehicle = await Vehicle.findByIdAndDelete(req.params.vehicleId);
    res.status(200).json(deletedVehicle);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

const invite = async (req, res) => {
  try {

    const vehicle = await Vehicle.findById(req.params.vehicleId);

    if (!vehicle) {
      return res.status(404).json({ err: "Vehicle not found" });
    }

    if (!vehicle.owner.equals(req.user._id)) {
      return res.status(403).send("Only the owner can edit this vehicle!");
    }
    console.log('BODY>>>>>>', req.body);

    if (!req.body.username) {
      return res.status(404).json({ err: "Please provide a username" });
    }
    const invitedUser = await User.findOne({ username: req.body.username })

    if (!invitedUser) {
      return res.status(404).json({ err: "User not found" });
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.vehicleId,
      {
        $push: { sharedUsers: invitedUser._id },
      },
      { returnDocument: 'after' }
    )

    res.status(200).json(updatedVehicle);

  } catch (err) {
    res.status(500).json({ err: err.message });
  }
}

const deleteInvite = async (req, res) => {
  try {

    const vehicle = await Vehicle.findById(req.params.vehicleId);

    if (!vehicle) {
      return res.status(404).json({ err: "Vehicle not found" });
    }

    if (!vehicle.owner.equals(req.user._id)) {
      return res.status(403).send("Only the owner can edit this vehicle!");
    }

    if (!req.body.invite) {
      return res.status(404).json({ err: "Please provide a username" });
    }
    const invitedUser = await User.find({ username: req.body.invite })

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.vehicleId,
      {
        $pull: { sharedUsers: invitedUser._id },
      },
      { returnDocument: 'after' }
    )

    res.status(200).json(updatedVehicle);

  } catch (err) {
    res.status(500).json({ err: err.message });
  }
}

const invitedIndex = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ sharedUsers: req.user._id })
      .populate("owner")
      .sort({ editedAt: -1 });

    res.status(200).json(vehicles);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

const invitedShow = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.vehicleId)

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
  update,
  deleteVehicle,
  invitedIndex,
  invitedShow,
  invite,
  deleteInvite
};