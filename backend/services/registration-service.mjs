import bcrypt from 'bcrypt'
import { diContainer } from '../di/di.mjs'
import { SERVICES } from '../di/api.mjs'

export function registrationService() {
	const userDao = diContainer.resolve(SERVICES.dao)
	async function registerUser(username, password, email) {
		try {
			const hashedPassword = await hashPassword(password)
			const userData = {
				username,
				password: hashedPassword,
				email,
			}
			const newUser = await userDao.createUser(userData)
			return !!newUser
		} catch (error) {
			throw new Error(error)
		}
	}
	return { getRegisteredUser: registerUser }
}

async function hashPassword(password) {
	const saltRounds = 10
	const salt = await bcrypt.genSaltSync(saltRounds)
	const hash = await bcrypt.hash(password, salt)
	return hash
}
