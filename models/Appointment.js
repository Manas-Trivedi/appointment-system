const mongoose = require('mongoose')

const appointmentSchema = new mongoose.Schema({
    studentId: {type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true},
    professorId: {type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true},
    availabilityId: {type: mongoose.SchemaTypes.ObjectId, ref: 'Availability', required: true},
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: { type: String, enum: ['booked', 'cancelled'], default: 'booked' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);
