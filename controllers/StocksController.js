import request from 'request';
import StockModel from "../models/Stock.js";
import UserModel from "../models/User.js";

import {arrayFromLength} from "./helpers/common.js";
import {getPageContent} from  './helpers/puppeteer.js'

import cheerio from 'cheerio'
import chalk from 'chalk'
import {slugify} from 'transliteration'
import PostModel from "../models/Post.js";

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
    for(let i = 0; i < Object.keys(data).length; ++i)
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
        StockModel.findOne(
            {
                symbol: req.body.symbol,
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
                 UserModel.findByIdAndUpdate(req.userId, {
                         $push: {
                             stocks: {
                                     symbol: req.body.symbol,
                                     quantity: Number(req.body.quantity)
                                 }
                         },
                         $inc: {
                             stocksBalance: Number(JSON.parse(doc.timeSeries)[0].price) * req.body.quantity,
                             currencyBalance: -Number(JSON.parse(doc.timeSeries)[0].price) * req.body.quantity,
                         }
                     },
                     {returnDocument: 'after'},
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
        )
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось создать акцию'
        })
    }
}

const spliceStock = (Arr, s) => {
    let arr = JSON.parse(JSON.stringify(Arr))
    for(let i = 0; i < arr.length; ++i) {
        if(arr[i].symbol === s) {
            arr.splice(i, 1)
            break
        }
    }
    console.log(arr)
    return arr
}

export const sellStocks = async (req, res) => {
    UserModel.findByIdAndUpdate(req.userId, {}, {
        returnDocument: 'after'
    },
        (err, user) => {
            if (err) {
                console.log(err)
                return res.status(500).json({
                    message: 'Не удалось вернуть акцию'
                })
            }

            if (!user) {
                return res.status(404).json({
                    message: 'Акция не найдена'
                })
            }

            try {
                StockModel.findOne(
                    {
                        symbol: req.body.symbol,
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
                        console.log(Number(JSON.parse(doc.timeSeries)[0].price) * req.body.quantity)

                        UserModel.findByIdAndUpdate(req.userId,
                            {
                                stocks: spliceStock(user.stocks, req.body.symbol),
                                $inc: {
                                    stocksBalance: -Number(JSON.parse(doc.timeSeries)[0].price) * req.body.quantity,
                                    currencyBalance: Number(JSON.parse(doc.timeSeries)[0].price) * req.body.quantity,
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

                                res.json(doc)
                            }
                        )
                    }
                )


            } catch (err) {
                console.log(err)
                res.status(500).json({
                    message: 'Не удалось создать акцию'
                })
            }
        });




}


// export const getStock = async (req, res) => {
//     StockModel.findOne(
//         {
//             symbol: req.params.symbol,
//         },
//         (err, doc) => {
//             if (err) {
//                 console.log(err)
//                 return res.status(500).json({
//                     message: 'Не удалось вернуть акцию'
//                 })
//             }
//
//             if (!doc) {
//                 return res.status(404).json({
//                     message: 'Акция не найдена'
//                 })
//             }
//
//             let arr = []
//             try {
//                 //const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY_EXTENDED&symbol=IBM&interval=1min&slice=year1month1&apikey=Y2Z7X4GZJN286RCZ`;
//                 const url = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=AAPL&apikey=Y2Z7X4GZJN286RCZ'
//                 request.get({
//                     url: url,
//                     json: true,
//                     headers: {'User-Agent': 'request'}
//                 }, (err, ress, data) => {
//                     if (err) {
//                         console.log('Error:', err);
//                     } else if (ress.statusCode !== 200) {
//                         console.log('Status:', ress.statusCode);
//                     } else {
//                         if (getTimes(data) === -1)
//                             res.status(500).json({
//                                 message: 'Не удалось получить акцию'
//                             })
//                         else {
//                             arr = getTimes(data)
//                             const url = 'https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=AAPL&apikey=Y2Z7X4GZJN286RCZ'
//                             request.get({
//                                 url: url,
//                                 json: true,
//                                 headers: {'User-Agent': 'request'}
//                             }, (err, ress, data) => {
//                                 if (err) {
//                                     console.log('Error:', err);
//                                 } else if (ress.statusCode !== 200) {
//                                     console.log('Status:', ress.statusCode);
//                                 } else {
//                                     if (getTimes(data) === -1)
//                                         res.status(500).json({
//                                             message: 'Не удалось получить акцию'
//                                         })
//                                     else {
//                                         arr = {...arr, ...getTimes(data)}
//                                         console.log(doc)
//                                         res.json({
//                                             name: doc.name,
//                                             symbol: doc.symbol,
//                                             imageUrl: doc.imageUrl,
//                                             timeSeries: getArray(arr)
//                                     })
//                                     }
//                                 }
//                             });
//                         }
//                     }
//                 });
//             } catch (err) {
//                 console.log(err)
//                 res.status(500).json({
//                     message: 'Не удалось получить акцию'
//                 })
//             }
//         }
//     )
//
// }


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

