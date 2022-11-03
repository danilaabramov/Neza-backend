import mongoose from "mongoose"

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    title2: {
        type: String,
        default: ""
    },
    text: {
        type: String,
        required: true,
        unique: true
    },
    tags: {
        type: Array,
        default: []
    },
    viewsCount: {
        type: Number,
        default: 0
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    imageUrl: {
        type: String,
        default: ''
    },
    comments: {
        type: Array,
        default: []
    },
}, {
    timestamps: true
})

export default mongoose.model('Post', PostSchema)