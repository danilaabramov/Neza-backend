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
    balance: {
        type: Array,
        default: [10000, 0]
    }
}, {
    timestamps: true
})

export default mongoose.model('User', UserSchema)
