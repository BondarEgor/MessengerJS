import { validateFields } from '../middlewares/validateFields.mjs'

export const emailPasswordValidator = validateFields({ body: ['email', 'password'] })

export const usernameEmailPasswordValidator = validateFields({ body: ['email', 'password', 'username'] })

export const usernamePasswordValidator = validateFields({ body: ['username', 'password'] })

export const usernameEmailValidator = validateFields({ body: ['username', 'email'] })

export const contentValidator = validateFields({ body: ['content'] })

export const typeDescNameValidator = validateFields({ body: ['name', 'type', 'description'] })

export const authorContentValidator = validateFields({ body: ['author', 'content'] })


