import { body } from "express-validator"

export const loginValidation = [
    //body('email', 'Неверный формат почты').isEmail(),
    body('password', "Пароль должен быть минимум 4 символа").isLength({ min: 4 }),
]

export const registerValidation = [
    //body('email', 'Неверный формат почты').isEmail(),
    body('password', "Пароль должен быть минимум 4 символа").isLength({ min: 4 }),
    body('fullName', "Укажите имя").isLength({min: 1}),
    //body('avatarUrl', "Неверная ссылка на аватарку").optional().isURL(),
]

export const postCreateValidation = [
    body('title', 'Введите заголовок статьи').isLength({ min: 1 }).isString(),
    body('text', "Введите текст статьи").isLength({ min: 1 }).isString(),
    body('tags', "Неверный формат тэгов (укажите массив)").optional().isString(),
    body('avatarUrl', "Неверная ссылка на изображение").optional().isString(),
]
