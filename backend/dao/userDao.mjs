import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';
import { PATHS } from '../constants.js';
import { userMapper } from '../dto/usersDto.mjs';

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

export class UserDao {
  #filePath = path.join(_dirname, '../data', PATHS.users);

  async createUser(userData) {
    const users = (await this.#readUsers()) || {};
    const { email } = userData;
    //Здесь мы хотим проверить по почте, тк почта - уникальное поле
    const userAlreadyExists = await this.getUserByEmail(email);

    if (userAlreadyExists) {
      throw new Error('User already exists');
    }

    const userId = uuid();
    users[userId] = { ...userData, userId };

    return this.#writeUsers(users);
  }

  async getUserByEmail(userEmail) {
    const users = await this.#readUsers();

    return Object.values(users).find(({ email }) => email === userEmail);
  }

  async getUserById(userId) {
    const users = await this.#readUsers();

    return userMapper(users[userId]) ?? null;
  }

  async getAllUsers() {
    const users = await this.#readUsers();

    return Object.values(users).map(userMapper);
  }

  async deleteUserById(userId) {
    const users = await this.#readUsers();
    const userAlreadyExists = await this.#doesUserExist(userId);

    if (!userAlreadyExists) {
      throw new Error(`User with id ${userId} not found`);
    }

    return userMapper(users[userId]);
  }

  async updateUser(updateData, userId) {
    const users = await this.#readUsers();
    const userAlreadyExists = await this.#doesUserExist(userId);

    if (!userAlreadyExists) {
      throw new Error(`User with ${userId} not found`);
    }

    users[userId] = { ...users[userId], ...updateData };
    await this.#writeUsers(users);

    return userMapper(users[userId]);
  }

  async #readUsers() {
    try {
      const data = await fs.readFile(this.#filePath, 'utf-8');

      return JSON.parse(data) || {};
    } catch (error) {
      const directoryPath = path.dirname(this.#filePath);

      await fs.mkdir(directoryPath, { recursive: true });
      await fs.writeFile(this.#filePath, JSON.stringify([]));

      throw error;
    }
  }

  async #writeUsers(users) {
    try {
      await fs.writeFile(this.#filePath, JSON.stringify(users, null, 2));

      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async #doesUserExist(userId) {
    const users = await this.#readUsers();

    return Object.values(users).some((user) => user.userId === userId);
  }
}
