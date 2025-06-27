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

const Availability = require('./models/Availability')

app.post('/availability', auth, async (req, res) => {
    try {
        if(req.user.role != 'professor') {
            return res.status(403).json({error: 'Only professors can set availability'})
        }

        const {date, startTime, endTime} = req.body;

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

app.listen(3000, () => {
    console.log('Server running on Port 3000');
})
