import express from 'express'
import fs from 'fs'
import multer from 'multer'
import cors from 'cors'

import mongoose from "mongoose"

import {registerValidation, loginValidation, postCreateValidation} from './validations.js'

import { handleValidationErrors, checkAuth, checkHack } from './utils/index.js'

import { UserController, PostController, ImageController, StocksController } from './controllers/index.js'

mongoose.connect(process.env.MONGODB_URI ? process.env.MONGODB_URI : "mongodb+srv://danila:1234qwer@cluster0.wiw6q.mongodb.net/neza?retryWrites=true&w=majority")
    .then(() => console.log('DB ok'))
    .catch((err) => console.log('DB error', err))

const app = express()

const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        if(!fs.existsSync('uploads')) {
            fs.mkdirSync('uploads')
        }
        cb(null, 'uploads')
    },
    filename: (_, file, cb) => {
        cb(null, file.originalname)
    }
})

const upload = multer({storage})

app.use(express.json({limit: '1gb'}))
app.use(express.urlencoded({limit: '1gb', extended: true}));
app.use(cors())
app.use('/uploads', express.static('uploads'))

app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login)
app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register)
app.get('/auth/me', checkAuth, UserController.getMe)

app.post('/auth/login/check', UserController.loginCheck)

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
    res.json({
        url: `/uploads/${req.file.originalname}`
    })
})

app.get('/tags', PostController.getLastTags)
app.get('/comments', PostController.getLastComments)

app.get('/posts', PostController.getAll)
app.get('/posts/limit/:length/date/:date', PostController.getAllLimit)
app.get('/posts/:id', PostController.getOne)
app.get('/posts/:id/prev', PostController.getOnePrev)
app.get('/posts/:id/next', PostController.getOneNext)

app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create)
app.delete('/posts/:id', checkAuth, PostController.remove)
app.patch('/posts/:id', checkAuth, postCreateValidation, handleValidationErrors, PostController.update)
app.patch('/posts/:id/comment', checkAuth, handleValidationErrors, PostController.comment)


app.get('/images', ImageController.getAll)
app.get('/images/limit/:length/date/:date', ImageController.getAllLimit)

app.post('/images', ImageController.create)


app.get('/stocks/:symbol', StocksController.getTimeSeries)
app.get('/stocks/get/:symbol', StocksController.getStock)

app.post('/stocks', StocksController.postStock)
app.get('/stocks', StocksController.getAll)
//app.get('/stockss', StocksController.getStockss)

app.get('/stocks-portfolio', checkAuth, StocksController.getStocksPortfolio)

app.post('/stocks/buy', checkAuth, handleValidationErrors, StocksController.buyStocks)
app.post('/stocks/sell', checkAuth, handleValidationErrors, StocksController.sellStocks)

app.listen(process.env.PORT || 4444, (err) => {
    if (err) return console.log(err)
    console.log('Server OK')
})















