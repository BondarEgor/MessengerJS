import bcrypt from 'bcrypt'
import UserDao from '../userDao/userDao.mjs'

export function registrationService() {
	function registerUser(username, password, email) {
		try{
			
		}catch(error) {

		}
	}
	return { getRegisteredUser: registerUser }
}

async function hashPassword(password){
	const saltRounds = 10
	const salt = await bcrypt.genSalt(saltRounds)
	const hash = await bcrypt.hash(password,salt)
	return hash
}
