import { validateFields } from '../middlewares/validateFields.mjs'

const emailPasswordValidate = () => {
    return validateFields({
        body: ['email', 'password']
    })
}
export const emailPasswordValidator = emailPasswordValidate()

const usernameEmailPasswordValidate = () => {
    return validateFields({
        body: ['email', 'password', 'username']
    })
}
export const usernameEmailPasswordValidator = usernameEmailPasswordValidate()

const usernamePasswordValidate = () => {
    return validateFields({
        body: ['username', 'password']
    })
}

export const usernamePasswordValidator = usernamePasswordValidate()

const usernameEmailValidate = () => {
    return validateFields({
        body: ['username', 'email']
    })
}

export const usernameEmailValidator = usernameEmailValidate()


const contentValidate = () => {
    return validateFields({
        body: ['content']
    })
}

export const contentValidator = contentValidate()

const typeDescNameValidate = () => {
    return validateFields({
        body: ['name', 'type', 'description']
    })
}

export const typeDescNameValidator = typeDescNameValidate()

const authorContentValidate = () => {
    return validateFields({
        body: ['author', 'content']
    })
}

export const authorContentValidator = authorContentValidate()
