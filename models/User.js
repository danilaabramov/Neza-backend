import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    number: {
        type: String,
        required: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    avatarUrl: {
        type: String,
        default: 'https://cdn.discordapp.com/attachments/803259316420214796/1038238060007145553/depositphotos_119670466-stock-illustration-user-icon-vector-male-person.webp'
    },
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
