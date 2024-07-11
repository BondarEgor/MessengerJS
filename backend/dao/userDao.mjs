import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { PATHS } from '../constants.js';
import { DataTransferObject } from '../dto/dto.mjs';

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

export class UserDao {
  #filePath = path.join(_dirname, '../data', PATHS.users);

  async #readUsers() {
    try {
      const data = await fs.readFile(this.#filePath, 'utf-8');
      return JSON.parse(data);
    } catch (_) {
      await fs.writeFile(this.#filePath, JSON.stringify([]));
    }
  }
  async #writeUsers(users) {
    await fs.writeFile(this.#filePath, JSON.stringify(users, null, 2));
  }

  async #isUserExists(userId) {
    const users = await this.#readUsers();

    return Object.values(users).some((user) => user.userId === userId);
  }

  async createUser(userData) {
    const users = (await this.#readUsers()) || {};
    const { username } = userData;

    const isExists = await this.getUserByName(username);

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

    return users[userId] ? { ...users[userId], password: null } : {};
  }

  async getAllUsers() {
    const data = await this.#readUsers();
    const users = Object.values(data);

    if (users.length === 0) {
      throw new Error('No users found');
    }

    const dtoUsers = users.map(DataTransferObject);

    return dtoUsers;
  }

  async deleteUserById(userId) {
    const users = await this.#readUsers();
    try {
      const isUserExists = await this.#isUserExists(userId);

      if (!isUserExists) {
        throw new Error(`User with id ${userId} not found`);
      }

      delete users[userId];
      await this.#writeUsers(users);

      return userId;
    } catch (e) {
      throw new Error('');
    }
  }

  async updateUser(updateData, userId) {
    const users = await this.#readUsers();
    const { userName } = updateData;

    if (!this.#isUserExists(userName)) {
      throw new Error(`User with ${userId} not found`);
    }

    users[userId] = { ...users[userId], ...updateData };
    await this.#writeUsers(users);

    return users[userId];
  }
}
