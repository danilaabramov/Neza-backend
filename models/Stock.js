import mongoose from "mongoose"

const StockSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    symbol:{
        type: String,
        required: true,
        unique: true
    },
    imageUrl: {
        type: String,
        required: true,
        unique: true
    },
    timeSeries: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
})

export default mongoose.model('Stock', StockSchema)
