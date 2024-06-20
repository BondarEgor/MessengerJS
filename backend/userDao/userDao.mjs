import { error } from 'console'
import fs from 'fs/promises'

export default class UserDao {
	#filePath = '../users.json'

	async readUsersFromFile() {
		try {
			const data = await fs.readFile(this.#filePath, 'utf-8')
			return JSON.parse(data)
		} catch (error) {
			//Ошибка, что файл не существует
			if (error.code === 'ENOENT') {
				return []
			}
			throw new Error('Failed to read file')
		}
	}

	async saveUsersToFile(users) {
		return fs.writeFile(this.#filePath, JSON.stringify(users, null, 2))
	}
	isUserExists(users, username) {
		return users.find(user => user.username === username)
	}

	async createUser(userData) {
		const users = await this.readUsersFromFile()
		const { username } = userData
		const isExists = this.isUserExists(users, username)
		if (isExists) {
			throw new Error('User already exists')
		}
		const newUser = { id: users.length++, ...userData }
		users.push(newUser)
		await this.saveUsersToFile(users)
		return newUser
	}

	async getUser(userId) {
		const users = await this.readUsersFromFile()
		return users.find(user => user.id === userId)
	}

	async deleteUser(userId) {
		const users = await this.readUsersFromFile()
		const userIndex = users.findIndex(user => user.id === userId)
		if (!userIndex == -1) {
			throw new Error('User not found')
		}
		const deletedUser = users.splice(userIndex, 1)[0]
		await this.saveUsersToFile(users)
		return deletedUser
	}

	updateUser(userId, updateDate) {
		const users = this.readUsersFromFile()
		//Ищем индекс, потому что юзеры могут быть в любом порядке
		const userIndex = users.findIndex(user => user.id === userId)

		if (userIndex === -1) {
			throw new Error('User not found ')
		}
		users[userIndex] = { ...users[userIndex], ...updateDate }
		this.saveUsersToFile(users)
		return users[userIndex]
	}
}
