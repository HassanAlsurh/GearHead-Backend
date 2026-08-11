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
            // required: true,
        },
        publicId: {
            type: String,
            // required: true,
        },
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // sharedUsers: [{
    // }], //if I have time I will be trying to add a way to invite other user to a certain 'Vehicle'
    serviceRecords: [serviceRecordSchema],
}, { timestamps: true });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
module.exports = Vehicle;


// image: {
//     type: String,
//     default: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80'
// },


// bookCover: {
//     url: {
//         type: String,
//             required: true,
//       },
//     publicId: {
//         type: String,
//             required: true,
//       },
// },