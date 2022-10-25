import ImageModel from "../models/Image.js";
import PostModel from "../models/Post.js";

export const getAll = async (req, res) => {
    try {
        const images = await ImageModel.find().sort({_id: -1}).exec()

        res.json(images)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось получить изображения'
        })
    }
}

export const getAllLimit = async (req, res) => {
    try {
        const images = await ImageModel.find({createdAt: {$lte: req.params.date === "0" ? "3000-07-30T11:32:55.326+00:00" : req.params.date}}).sort({_id: -1}).limit(1).skip(req.params.length ).exec()

        res.json(images)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось получить изображения'
        })
    }
}

export const create = async (req, res) => {
    try {
        const doc = new ImageModel({
            imageUrl: req.body.imageUrl,
        })

        const image = await doc.save()

        res.json(image)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось добавить изображение'
        })
    }
}