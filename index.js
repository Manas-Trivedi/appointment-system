require('dotenv').config();
const express = require('express')
const mongoose = require('mongoose')
const auth = require('./middleware/auth')

const app = express()
app.use(express.json())

const conn_str = process.env.MONGO_CONN;

mongoose.connect(conn_str)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.log('MongoDB Connection Error: ', err));

app.get('/', (req, res) => {
    res.json({message: 'Appointment system API'})
})

const User = require('./models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

app.post('/auth/login', async (req, res) => {
    try {
        const {email, password} = req.body;

        const user = await User.findOne({email});
        if(!user) {
            return res.status(400).json({error: "User does not exist"})
        } else if(!(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({error: "Invalid Credentials"})
        }

        const token = jwt.sign({userId: user._id, role: user.role}, process.env.JWT_SECRET);

        res.json({token, user: {id: user._id, name: user.name, role: user.role}});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

app.post('/auth/signup', async (req, res) => {
    try {
        const {name, email, password, role} = req.body;

        const existing = await User.findOne({email})

        if(existing) {
            return res.status(400).json({error: 'User already exists'})
        }

        const user = new User({
            name,
            email,
            password: await bcrypt.hash(password, 10),
            role
        })

        await user.save();
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET);

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: { id: user._id, name: user.name, role: user.role }
        });
    } catch(error) {
        res.status(500).json({error: error.message})
    }
})

const Availability = require('./models/Availability');
const Appointment = require('./models/Appointment');

app.post('/availability', auth, async (req, res) => {
    try {
        if(req.user.role != 'professor') {
            return res.status(403).json({error: 'Only professors can set availability'})
        }

        const {date, startTime, endTime} = req.body;

        const existingSlots = await Availability.find({
            professorId: req.user._id,
            date: new Date(date)
        })

        const hasOverlap = existingSlots.some(slot => {
            const newStart = startTime;
            const newEnd = endTime;

            return (newStart < slot.endTime && newEnd > slot.startTime)
        })

        if (hasOverlap) {
            return res.status(400).json({ error: 'Time slot overlaps with existing availability' });
        }

        const availability = new Availability({
            professorId: req.user._id,
            date: new Date(date),
            startTime,
            endTime
        })

        await availability.save()

        res.status(201).json({message: "Availability set successfully", availability})

    } catch(err) {
        return res.status(400).json({error: err.message})
    }
})

app.get('/professor/:professorId/availability', auth, async (req, res) => {
    try {
        const { professorId } = req.params

        const availableSlots = await Availability.find({
            professorId,
            isBooked: false
        })

        res.json({ availableSlots })
    } catch(err) {
        return res.status(400).json({error: err.message})
    }
})

app.post('/appointment/:slotId', auth, async (req, res) => {
    try {
        if(req.user.role !== 'student') {
            return res.status(400).json({error: 'Only students can book assignments'})
        }

        if(!req.body.slotId || (await Availability.findById(req.body.slotId)).isBooked) {
            return res.status(400).json({ error: "Slot unavailable" })
        }

        const {professorId, date, startTime, endTime} = await Availability.findById(req.body.slotId);

        const appointment = new Appointment({
            studentId: req.user._id,
            professorId: professorId,
            availabilityId: req.params.slotId,
            date: date,
            startTime: startTime,
            endTime: endTime,
            status: 'booked'
        })

        await appointment.save()
        await Availability.findByIdAndUpdate(req.body.slotId, { isBooked: true });

        res.status(201).json({message: "Appointment booked successfully", appointment})


    } catch(err) {
        return res.status(500).json({error: err.message})
    }
})

app.get('/appointments', auth, async (req, res) => {
    try {
        let appointments;

        if (req.user.role === 'student') {
            appointments = await Appointment.find({ studentId: req.user._id })
                .populate('professorId', 'name email')
                .sort({ date: 1, startTime: 1 });
        } else if (req.user.role === 'professor') {
            appointments = await Appointment.find({ professorId: req.user._id })
                .populate('studentId', 'name email')
                .sort({ date: 1, startTime: 1 });
        } else {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json({ appointments });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
})

app.listen(3000, () => {
    console.log('Server running on Port 3000');
})
