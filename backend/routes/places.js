import express from 'express';
import Place from '../models/place.js';
import Comment from '../models/comment.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();


router.get('/places', async (_, res) => {
    try {
        const places = await Place.find({ approved: true })
            .populate('submittedBy', 'username')
            .populate({ path: 'comments', populate: { path: 'author', select: 'username' } });
        res.json(places);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.post('/places', protect, async (req, res) => {
    try {
        const { title, description, position } = req.body;
        const place = new Place({
            title,
            description,
            position,
            approved: false,
            submittedBy: req.user._id
        });
        await place.save();
        res.status(201).json(place);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.get('/places/mine', protect, async (req, res) => {
    try {
        const places = await Place.find({ submittedBy: req.user._id, approved: false });
        res.json(places);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.get('/places/pending', protect, async (req, res) => {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Not authorized' });
    try {
        const places = await Place.find({ approved: false })
            .populate('submittedBy', 'username');
        res.json(places);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.patch('/places/:id/approve', protect, async (req, res) => {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Not authorized' });
    try {
        const place = await Place.findByIdAndUpdate(
            req.params.id,
            { approved: true },
            { new: true }
        );
        res.json(place);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.delete('/places/:id', protect, async (req, res) => {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Not authorized' });
    try {
        await Place.findByIdAndDelete(req.params.id);
        res.json({ message: 'Place deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.post('/places/:id/comments', protect, async (req, res) => {
    try {
        const { text } = req.body;
        const comment = await Comment.create({
            text,
            author: req.user._id,
            place: req.params.id
        });
        await Place.findByIdAndUpdate(req.params.id, { $push: { comments: comment._id } });
        await comment.populate('author', 'username');
        res.status(201).json(comment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.post('/places/:id/rate', async (req, res) => {
    try {
        const { score, guestId } = req.body;
        const place = await Place.findById(req.params.id);
        const existing = place.ratings.find(r => r.guestId === guestId);
        if (existing) {
            existing.score = score;
        } else {
            place.ratings.push({ guestId, score });
        }
        await place.save();
        res.json({ message: 'Rating saved' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


export default router;
