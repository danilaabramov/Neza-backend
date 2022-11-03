import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    avatarUrl: String,
    currencyBalance: {
        type: Number,
        default: 10000
    },
    stocksBalance: {
        type: Number,
        default: 0
    },
    stocks: {
        type: Array,
        default: []
    },
}, {
    timestamps: true
})

export default mongoose.model('User', UserSchema)
