const mongoose = require('mongoose');

const currentYear = new Date().getFullYear();
const maxModelYear = currentYear + 1;

const serviceRecordSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    category: {
        type: String,
        required: true,
        enum: ['Maintenance', 'Repair', 'Modification', 'Detailing', 'Other'],
        default: 'Other',
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    cost: {
        type: Number,
        required: true,
        min: 0
    },
    mileageAtService: {
        type: Number,
        required: true,
        min: 0
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

const vehicleSchema = new mongoose.Schema({
    year: {
        type: Number,
        required: true,
        min: 1900,
        max: maxModelYear
    },
    make: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    model: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    mileage: {
        type: Number,
        required: true,
        min: 0
    },
    image: {
        url: {
            type: String,
        },
        publicId: {
            type: String,
        },
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sharedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    serviceRecords: [serviceRecordSchema],
}, { timestamps: true });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
module.exports = Vehicle;