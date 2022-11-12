import request from 'request';
import StockModel from "../models/Stock.js";
import StockHistoryModel from "../models/StockHistory.js";
import UserModel from "../models/User.js";
import StockPortfolioModel from "../models/StockPortfolio.js";

import {arrayFromLength} from "./helpers/common.js";
import {getPageContent} from './helpers/puppeteer.js'

import cheerio from 'cheerio'
import chalk from 'chalk'
import {slugify} from 'transliteration'
import PostModel from "../models/Post.js";
import mongoose from "mongoose";
import StockHistorySchema from "../models/StockHistory.js";
import StocksPortfolio from "../models/StockPortfolio.js";

const SITE = 'https://auto.ru/catalog/cars/all/?page_num='
const pages = 2

// export const getStock = async (req, res) => {
//     try {
//         for (const page of arrayFromLength(pages)) {
//             const url = `${SITE}${page}`
//             const pageContent = await getPageContent(url)
//             const $ = cheerio.load(pageContent)
//             const carsItems = []
//             $('.mosaic__title').each((i, header) => {
//                 const url = $(header).attr('href')
//                 const title = $(header).text()
//
//                 carsItems.push({
//                     title,
//                     url,
//                     code: slugify(title)
//                 })
//             })
//             return carsItems
//         }
//     } catch (err) {
//        console.log(chalk.red('An error has occured \n'))
//         console.log(err)
//     }
//
// }

const getTimes = (data) => {
    if (Object.keys(data).length === 1) return -1
    return data[Object.keys(data)[1]]
}

const getArray = (data) => {
    let arr = []
    for (let i = 0; i < Object.keys(data).length; ++i)
        arr.push({
            time: Object.keys(data)[i],
            price: data[Object.keys(data)[i]]['4. close']
        })
    return arr
}


export const getTimeSeries = async (req, res) => {
    let arr = []
    try {
        //const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY_EXTENDED&symbol=IBM&interval=1min&slice=year1month1&apikey=Y2Z7X4GZJN286RCZ`;
        const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${req.params.symbol}&apikey=Y2Z7X4GZJN286RCZ`
        request.get({
            url: url,
            json: true,
            headers: {'User-Agent': 'request'}
        }, (err, ress, data) => {
            if (err) {
                console.log('Error:', err);
            } else if (ress.statusCode !== 200) {
                console.log('Status:', ress.statusCode);
            } else {
                if (getTimes(data) === -1)
                    res.status(500).json({
                        message: 'Не удалось получить акцию'
                    })
                else {
                    arr = getTimes(data)
                    // const url = `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=${req.params.symbol}&apikey=Y2Z7X4GZJN286RCZ`
                    // request.get({
                    //     url: url,
                    //     json: true,
                    //     headers: {'User-Agent': 'request'}
                    // }, (err, ress, data) => {
                    //     if (err) {
                    //         console.log('Error:', err);
                    //     } else if (ress.statusCode !== 200) {
                    //         console.log('Status:', ress.statusCode);
                    //     } else {
                    //         if (getTimes(data) === -1)
                    //             res.status(500).json({
                    //                 message: 'Не удалось получить акцию'
                    //             })
                    //         else {
                    //             arr = {...arr, ...getTimes(data)}
                    //             res.json(arr)
                    //         }
                    //     }
                    // });
                    res.json(arr)
                }
            }
        });
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось получить акцию'
        })
    }
}

export const postStock = async (req, res) => {
    try {
        const doc = new StockModel({
            name: req.body.name,
            symbol: req.body.symbol,
            imageUrl: req.body.imageUrl,
            timeSeries: req.body.timeSeries,
        })

        const post = await doc.save()
        res.json(post)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось создать акцию'
        })
    }
}

export const buyStocks = async (req, res) => {
    try {
        const doc1 = new StockHistoryModel({
            name: req.body.shortName,
            shortName: req.body.shortName,
            boardId: req.body.boardId,
            imageUrl: req.body.imageUrl,
            totalCost: req.body.totalCost,
            quantity: req.body.quantity,
            status: 'buy',
            user: req.userId,
            volute: req.body.volute
        })

        StockPortfolioModel.findOneAndUpdate({
                shortName: req.body.shortName
            },
            {
                $inc: {
                    totalCost: req.body.totalCost,
                    quantity: req.body.quantity,
                }
            },
            {
                returnDocument: 'after'
            }, async (err, doc2) => {
                if (err) {
                    console.log(err)
                    return res.status(500).json({
                        message: 'Не удалось вернуть акцию'
                    })
                }

                if (!doc2) {
                    doc2 = new StockPortfolioModel({
                        shortName: req.body.shortName,
                        boardId: req.body.boardId,
                        imageUrl: req.body.imageUrl,
                        totalCost: req.body.totalCost,
                        quantity: req.body.quantity,
                        user: req.userId,
                        volute: req.body.volute
                    })
                }

                UserModel.findByIdAndUpdate(req.userId,
                    {
                        $inc: {
                            stocksBalance: req.body.totalCost,
                            currencyBalance: -req.body.totalCost,
                        }
                    },
                    {
                        returnDocument: 'after'
                    },
                    (err, doc) => {
                        if (err) {
                            console.log(err)
                            return res.status(500).json({
                                message: 'Не удалось вернуть акцию'
                            })
                        }

                        if (!doc) {
                            return res.status(404).json({
                                message: 'Акция не найдена'
                            })
                        }
                    }
                )

                await doc1.save()
                const portfolio = await doc2.save()
                res.json(portfolio)
            })

    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось создать историю'
        })
    }
}

export const sellStocks = async (req, res) => {
    try {
        const doc1 = new StockHistoryModel({
            shortName: req.body.shortName,
            boardId: req.body.boardId,
            imageUrl: req.body.imageUrl,
            totalCost: req.body.totalCost,
            quantity: req.body.quantity,
            status: 'sell',
            user: req.userId,
            volute: req.body.volute
        })


        StockPortfolioModel.findOneAndUpdate({
                shortName: req.body.shortName
            },
            {
                $inc: {
                    totalCost: -req.body.totalCost,
                    quantity: -req.body.quantity,
                }
            },
            {
                returnDocument: 'after'
            }, async (err, doc2) => {
                if (err) {
                    console.log(err)
                    return res.status(500).json({
                        message: 'Не удалось вернуть акцию'
                    })
                }

                if (!doc2) {
                    doc2 = new StockPortfolioModel({
                        shortName: req.body.shortName,
                        boardId: req.body.boardId,
                        imageUrl: req.body.imageUrl,
                        totalCost: req.body.totalCost,
                        quantity: req.body.quantity,
                        user: req.userId,
                        volute: req.body.volute
                    })
                }

                UserModel.findByIdAndUpdate(req.userId,
                    {
                        $inc: {
                            stocksBalance: -req.body.totalCost,
                            currencyBalance: req.body.totalCost,
                        }
                    },
                    {
                        returnDocument: 'after'
                    },
                    (err, doc) => {
                        if (err) {
                            console.log(err)
                            return res.status(500).json({
                                message: 'Не удалось вернуть акцию'
                            })
                        }

                        if (!doc) {
                            return res.status(404).json({
                                message: 'Акция не найдена'
                            })
                        }
                    }
                )
                await doc1.save()
                const portfolio = await doc2.save()
                res.json(portfolio)
            })

    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось создать историю'
        })
    }
}


export const getStock = async (req, res) => {
    StockModel.findOne(
        {
            symbol: req.params.symbol,
        },
        (err, doc) => {
            if (err) {
                console.log(err)
                return res.status(500).json({
                    message: 'Не удалось вернуть акцию'
                })
            }

            if (!doc) {
                return res.status(404).json({
                    message: 'Акция не найдена'
                })
            }

            res.json(doc)
        }
    )
}

export const getAll = async (req, res) => {
    try {
        const stocks = await StockModel.find()

        res.json(stocks)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось получить акции'
        })
    }
}

export const getStocksPortfolio = async (req, res) => {
    try {
        const stocks = await StockPortfolioModel.find({user: req.userId})
        res.json(stocks)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось получить акции'
        })
    }
}
