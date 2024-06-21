import fs from 'fs/promises'
import { fileURLToPath } from 'url'
import path from 'path'
import PATHS from '../constants.js'
const _filename = fileURLToPath(import.meta.url)
const _dirname = path.dirname(_filename)
class UserDao {
	#filePath = path.join(_dirname, PATHS.users)

	async readUsersFromFile() {
		try {
			await fs.readFile(this.#filePath, 'utf-8')
			return JSON.parse(data)
		} catch (error) {
			throw new Error('Failed to read file')
		}
	}

	async saveUsersToFile(users) {
		return await fs.writeFile(this.#filePath, JSON.stringify(users))
	}

	isUserExists(users, username) {
		return users.find(user => user.username === username)
	}

	async createUser(userData) {
		try {
			console.log(this.#filePath)
			const users = await this.readUsersFromFile()
			const { username } = userData
			const isExists = this.isUserExists(users, username)
			if (isExists) {
				throw new Error('User already exists')
			}
			const newUser = { id: users.length + 1, ...userData }
			users.push(newUser)
			await fs.writeFile(this.#filePath, JSON.stringify([]))
			return newUser
		} catch (error) {
			if (error === 'ENOENT') {
				await fs.writeFile('users.json', JSON.stringify([userData]))
			}
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
