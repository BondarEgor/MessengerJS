import fs from 'fs/promises';
import path from 'path';
import PATHS from '../constants.js';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

export class UserDao {
  #filePath = path.join(_dirname, '../data', PATHS.users);

  async readUsersFromFile() {
    try {
      const data = await fs.readFile(this.#filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error === 'ENOENT')
        await fs.writeFile(this.#filePath, JSON.stringify([]));
    }
  }

  async saveUsersToFile(users) {
    await fs.writeFile(this.#filePath, JSON.stringify(users, null, 2));
  }

  isUserExists(users, userId) {
    return !!users[userId];
  }

  async createUser(userData) {
    try {
      const users = (await this.readUsersFromFile()) || {};
      const { username } = userData;
      const isExists = this.isUserExists(users, username);

      if (isExists) {
        throw new Error('User already exists');
      }

      const newUserId = uuid();
      users[newUserId] = { ...userData };

      await fs.writeFile(this.#filePath, JSON.stringify(users));
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async getUser(userId) {
    const users = await this.readUsersFromFile();

    return users[userId];
  }

  async deleteUser(userId) {
    try {
      const users = await this.readUsersFromFile();

      if (this.isUserExists(users, userId)) {
        delete users[userId];
        await this.saveUsersToFile(users);
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
    try {
      const users = await this.readUsersFromFile();

      if (this.isUserExists(users, userId)) {
        users[userId] = { ...users[userId], ...updateData };
        this.saveUsersToFile(users);
        return true;
      } else {
        throw new Error(`User with ${userId} not found`);
      }
    } catch (error) {
      console.error(error);

      return false;
    }
  }
}
