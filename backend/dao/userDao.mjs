import fs from 'fs/promises'
import path from 'path'
import PATHS from '../constants.js'
import { fileURLToPath } from 'url'

const _filename = fileURLToPath(import.meta.url)
const _dirname = path.dirname(_filename)
class UserDao {
	#filePath = path.join(_dirname,'../data', PATHS.users)

	async readUsersFromFile() {
		try {
			const data = await fs.readFile(this.#filePath, 'utf-8')
			return JSON.parse(data)
		} catch (error) {
			if(error === 'ENOENT')
				await fs.writeFile(this.#filePath, JSON.stringify([]))
		}
	}

	async saveUsersToFile(users) {
		await fs.writeFile(this.#filePath, JSON.stringify(users))
		return data
	}

	isUserExists(users, username) {
		return users?.find(user => user.username === username)
	}

	async createUser(userData) {
		try {
			const users = await this.readUsersFromFile() || []
			const { username } = userData
			console.log(users)
			const isExists = this.isUserExists(users, username)
			console.log(isExists)
			if (isExists) {
				throw new Error('User already exists')
			}
			const newUser = { id: (users?.length ?? 0) + 1, ...userData }
			users.push(newUser)
			await fs.writeFile(this.#filePath, JSON.stringify(users))
			return newUser
		} catch (error) {
			console.log(error)
		}
	}

	async getUser(userId) {
		const users = await this.readUsersFromFile()
		return users.find(user => user.id === userId)
	}

	async deleteUser(userId) {
		const users = await this.readUsersFromFile()
		const userIndex = users.findIndex(user => user.id === userId)
		if (userIndex == -1) {
			throw new Error('User not found')
		}
		const deletedUser = users.splice(userIndex, 1)[0]
		await this.saveUsersToFile(users)
		return deletedUser
	}

	async updateUser(userId, updateDate) {
		const users = this.readUsersFromFile()
		//Ищем индекс, потому что юзеры могут быть в любом порядке
		const userIndex = users.findIndex(user => user.id === userId)

		if (userIndex === -1) {
			throw new Error('User not found ')
		}
		users[userIndex] = { ...users[userIndex], ...updateDate }
		await this.saveUsersToFile(users)
		return users[userIndex]
	}
}

export default function userDaoFactory() {
	return new UserDao()
}
