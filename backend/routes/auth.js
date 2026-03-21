import express from 'express';
import User from '../models/users.js';
import jwt from 'jsonwebtoken';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const email = req.body.email?.toLowerCase();


    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    try {
      
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

    
        const user = await User.create({
            username,
            email,
            password,
        });

        const token = generateToken(user._id);

        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin,
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Invalid user data" });
    }
});

router.post('/login', async (req, res) => {
    const password = req.body.password;
    const email = req.body.email?.toLowerCase();


    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const user = await User.findOne({ email });

   
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = generateToken(user._id);

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin,
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get('/me', protect, async (req, res) => {
    res.status(200).json(req.user);
});

export default router;