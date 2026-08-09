// Service Records controller

const Vehicle = require('../models/vehicle')

const create = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.vehicleId);

        if (!vehicle) {
            return res.status(404).json({ err: 'Vehicle not found' })
        }

        if (!vehicle.owner.equals(req.user._id)) {
            return res.status(403).send("You're not authorized to add records to this vehicle!")
        }

        let toPush = {
            date: req.body.date,
            category: req.body.category,
            description: req.body.description,
            cost: req.body.cost,
            mileageAtService: req.body.mileageAtService,
            owner: req.user._id,
        }

        vehicle.serviceRecords.push(req.body)

        await vehicle.save()

        res.status(201).json(vehicle);
    } catch (err) {
        res.status(500).json({ err: err.message })
    }
}

module.exports = {
    create,
}