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

const update = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.vehicleId);

        if (!vehicle) {
            return res.status(404).json({ err: 'Vehicle not found' })
        }

        if (!vehicle.owner.equals(req.user._id)) {
            return res.status(403).send("You're not authorized to edit this vehicle's records!")
        }

        const record = vehicle.serviceRecords.id(req.params.recordId);

        if (!record) {
            return res.status(404).json({ err: 'Service record not found' })
        }


        record.category = req.body.category || record.category
        record.description = req.body.description || record.description
        record.cost = req.body.cost ?? record.cost
        record.mileageAtService = req.body.mileageAtService ?? record.mileageAtService
        record.date = req.body.date || record.date

        await vehicle.save();

        res.status(200).json(vehicle);
    } catch (err) {
        res.status(500).json({ err: err.message })
    }
}

const deleteRecord = async (req, res) => {
    try {
        const updatedVehicle = await Vehicle.findByIdAndUpdate(
            req.params.vehicleId,
            {
                $pull: { serviceRecords: { _id: req.params.recordId } }
            },
            { returnDocument: 'after' }
        );

        if (!updatedVehicle) {
            return res.status(404).json({ err: 'Vehicle not found' });
        }

        res.status(200).json(updatedVehicle);
    } catch (err) {
        res.status(500).json({ err: err.message })
    }
}

module.exports = {
    create,
    update,
    deleteRecord
}