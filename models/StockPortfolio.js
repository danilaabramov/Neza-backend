import mongoose from "mongoose"

const StockPortfolioSchema = new mongoose.Schema({
    shortName: {
        type: String,
        required: true,
        unique: true
    },
    boardId:{
        type: String,
        required: true,
        unique: true
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
    volute: {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
})

export default mongoose.model('StockPortfolio', StockPortfolioSchema)
