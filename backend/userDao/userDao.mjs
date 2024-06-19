import fs from 'fs/promises'

export default class UserDao {
	#filePath = 'egor-tsc-edu/backend/users.json'
	#nextId
	constructor() {
		this.#nextId = 1
	}

	async readUsersFromFile() {
		try {
			const data = await fs.readFile(this.#filePath, 'utf-8')
			return JSON.parse(data)
		} catch (error) {
			//Ошибка, что файл не существует
			if (!error.code === 'ENOENT') {
				return []
			}
			throw new Error('Failed to read file')
		}
	}

	async saveUsersToFile(users) {
		await fs.writeFile(this.#filePath, JSON.stringify(users, null, 2))
	}

	async createUser(userData) {
		const users = await this.readUsersFromFile()
		const newUser = { id: this.#nextId++, ...userData }
		users.push(newUser)
		await this.saveUsersToFile(users)
		return newUser
	}

	async getUserById(userId) {
		const users = await this.readUsersFromFile()
		return users.find(user => user.id === userId)
	}

	async deleteUserById(userId) {
		const users = this.readUsersFromFile()
		const userIndex = users.findIndex(user => user.id === userId)
		if (userIndex === -1) {
			throw new Error('User not found')
		}
		const deletedUser = users.splice(userIndex, 1)[0]
		this.saveUsersToFile(users)
		return deletedUser
	}

	updateUserById(userId, updateDate) {
		const users = this.readUsersFromFile()
		//Ищем индекс, потому что юзеры могут быть в любом порядке
		const userIndex = users.findIndex(user => user.id === userId)

		if(userIndex === -1){
			throw new Error('User not found ')
		}
		users[userIndex] = {...users[userIndex], ...updateDate}
		this.saveUsersToFile(users)
		return users[userIndex]
	}
}
