const mongoose = require('mongoose')

const availabilitySchema = new mongoose.Schema({
    professorId: {type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true},
    date: {type: Date, required: true},
    startTime: {type: String, required: true},
    endTime: {type: String, required: true},
    isBooked: {type: Boolean, default: false}
})

module.exports = mongoose.model('Availability', availabilitySchema);
