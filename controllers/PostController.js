import PostModel from '../models/Post.js'

export const getLastTags = async (req, res) => {
    try {
        const posts = await PostModel.find().exec()

        const tags = posts.reverse().map(obj => obj.tags).flat().slice(0, 5)

        res.json(tags)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось получить статьи'
        })
    }
}

export const getLastComments = async (req, res) => {
    try {
        const posts = await PostModel.find().exec()

        const comments = posts.reverse().map(obj => obj.comments).flat().slice(0, 5)

        res.json(comments)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось получить статьи'
        })
    }
}

export const getAll = async (req, res) => {
    try {
        const posts = await PostModel.find().populate('user').sort({_id:-1}).exec()

        res.json(posts)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось получить статьи'
        })
    }
}

export const getAllLimit = async (req, res) => {
    try {
        const posts = await PostModel.find( { createdAt : { $lte : req.params.date === "0" ? "3000-07-30T11:32:55.326+00:00" : req.params.date}} ).populate('user').sort({_id:-1}).limit(req.params.length !== "0" ? 10 : 11).skip(req.params.length !== "0" ? 1 + req.params.length * 10 : 0).exec()
        res.json(posts)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: req.params.date
        })
    }
}

export const getOne = async (req, res) => {
    try {
        const postId = req.params.id

        PostModel.findOneAndUpdate(
            {
                _id: postId,
            },
            {
                $inc: {viewsCount: 1}
            },
            {
                returnDocument: 'after'
            },
            (err, doc) => {
                if (err) {
                    console.log(err)
                    return res.status(500).json({
                        message: 'Не удалось вернуть статью'
                    })
                }

                if (!doc) {
                    return res.status(404).json({
                        message: 'Статья не найдена'
                    })
                }

                res.json(doc)
            }
        ).populate('user');

    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось получить статьи'
        })
    }
}

export const getOnePrev = async (req, res) => {
    try {
        const postId = req.params.id

        const posts = await PostModel.find({_id: {$lt: postId}}).sort({'_id': -1}).limit(1).populate('user')

        res.json(posts)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось получить статьи'
        })
    }
}

export const getOneNext = async (req, res) => {
    try {
        const postId = req.params.id

        const posts = await PostModel.find({_id: {$gt: postId}}).limit(1).populate('user')

        res.json(posts)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось получить статьи'
        })
    }
}


export const remove = async (req, res) => {
    try {
        const postId = req.params.id

        PostModel.findOneAndDelete({
            _id: postId
        }, async (err, doc) => {
            if (err) {
                console.log(err)
                return res.status(500).json({
                    message: 'Не удалось удалить статью'
                })
            }

            if (!doc) {
                return res.status(404).json({
                    message: 'Статья не найдена'
                })
            }

            res.json({
                success: true
            })
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось получить статьи'
        })
    }
}

export const create = async (req, res) => {
    try {
        const doc = new PostModel({
            title: req.body.title,
            title2: req.body.title2,
            text: req.body.text,
            imageUrl: req.body.imageUrl,
            tags: req.body.tags === '' ? [] : String(req.body.tags).split(', '),
            user: req.userId,
        })

        const post = await doc.save()

        res.json(post)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось создать статью'
        })
    }
}

export const update = async (req, res) => {
    try {
        const postId = req.params.id


        await PostModel.updateOne({
                _id: postId,
            },
            {
                title: req.body.title,
                title2: req.body.title2,
                text: req.body.text,
                imageUrl: req.body.imageUrl,
                user: req.userId,
                tags: req.body.tags === '' ? [] : String(req.body.tags).split(', '),
                comments: req.body.comments
            }
        )

        res.json({
            success: true
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось обновить статью'
        })
    }
}

export const comment = async (req, res) => {
    try {
        const postId = req.params.id

        PostModel.findOneAndUpdate(
            {
                _id: postId,
            },
            {
                $push: {comments: req.body.comment}
            },
            {
                returnDocument: 'after'
            },
            (err, doc) => {
                if (err) {
                    console.log(err)
                    return res.status(500).json({
                        message: 'Не удалось вернуть статью'
                    })
                }

                if (!doc) {
                    return res.status(404).json({
                        message: 'Статья не найдена'
                    })
                }

                res.json(doc)
            }
        ).populate('user');
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось добавить отзыв'
        })
    }
}
