import mongoose from "mongoose";

const placeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    position: {
        type: [Number],
        required: true
    },
    approved: {
        type: Boolean,
        default: false
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    ratings: [{
        guestId: { type: String },
        score: { type: Number, min: 1, max: 5 }
    }]
}, { timestamps: true });

const Place = mongoose.model("Place", placeSchema);

export default Place;