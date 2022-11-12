import mongoose from "mongoose"

const StockHistorySchema = new mongoose.Schema({
    shortName: {
        type: String,
        required: true,
    },
    boardId:{
        type: String,
        required: true,
    },
    imageUrl: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    totalCost: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    volute: {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
})

export default mongoose.model('StockHistory', StockHistorySchema)
