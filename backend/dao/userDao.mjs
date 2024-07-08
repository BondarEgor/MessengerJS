import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { PATHS } from '../constants.js';
import { v4 as uuidv4 } from 'uuid';

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

export class UserDao {
  #filePath = path.join(_dirname, '../data', PATHS.users);

  async #readUsers() {
    try {
      const data = await fs.readFile(this.#filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error === 'ENOENT')
        await fs.writeFile(this.#filePath, JSON.stringify([]));
    }
  }

  async #writeUsers(users) {
    await fs.writeFile(this.#filePath, JSON.stringify(users, null, 2));
  }

  #isUserExists(users, username) {
    return Object.values(users).find((user) => user.username === username);
  }

  async createUser(userData) {
    const users = (await this.#readUsers()) || {};

    const { username } = userData;
    const isExists = this.#isUserExists(users, username);

    if (isExists) {
      throw new Error('User already exists');
    }
    const userId = uuidv4();
    users[userId] = { ...userData, userId };

    await fs.writeFile(this.#filePath, JSON.stringify(users));

    return true;
  }

  async getUserByName(username) {
    const users = await this.#readUsers();
    const isUserExists = Object.values(users).find(
      (user) => user.username === username
    );

    return isUserExists ?? null;
  }

  async getUserById(userId) {
    const users = await this.#readUsers();

    return users[userId];
  }

  async deleteUser(userId) {
    try {
      const users = await this.#readUsers();

      if (this.#isUserExists(users, userId)) {
        delete users[userId];
        await this.#writeUsers(users);
        return true;
      } else {
        throw new Error(`User with id ${userId} not found`);
      }
    } catch (error) {
      console.error(error);

      return false;
    }
  }

  async updateUser(userId, updateData) {
    const users = await this.#readUsers();

    if (this.#isUserExists(users, userId)) {
      users[userId] = { ...users[userId], ...updateData };
      this.#writeUsers(users);

      return true;
    } else {
      throw new Error(`User with ${userId} not found`);
    }
  }
}
