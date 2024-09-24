import {validateFields} from '../middlewares/validateFields.mjs'

export const emailPasswordValidate = () => {
    return validateFields({
        body: ['email', 'password']
    })
}

export const usernameEmailPasswordValidate = () => {
    return validateFields({
        body: ['email', 'password', 'username']
    })
}

export const usernamePasswordValidate = () => {
    return validateFields({
        body: ['username', 'password']
    })
}

export const usernameEmailValidate = () => {
    return validateFields({
        body: ['username', 'email']
    })
}

export const contentValidate = () => {
    return validateFields({
        body: ['content']
    })
}
export const typeDescNameValidate = () => {
    return validateFields({
        body: ['name', 'type', 'description']
    })
}

export const authorContentValidate = () => {
    return validateFields({
        body: ['author', 'content']
    })
}