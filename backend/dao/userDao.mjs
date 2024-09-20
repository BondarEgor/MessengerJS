import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { PATHS } from '../constants.js';
import { UsersDto } from '../dto/usersDto.mjs';

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

export class UserDao {
  #filePath = path.join(_dirname, '../data', PATHS.users);

  async #readUsers() {
    try {
      const data = await fs.readFile(this.#filePath, 'utf-8');

      return JSON.parse(data);
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

  async #isUserExists(userId) {
    const users = await this.#readUsers();

    return Object.values(users).some((user) => user.userId === userId);
  }

  async createUser(userData) {
    const users = (await this.#readUsers()) || {};
    const { email } = userData;
    const isExists = await this.getUserByEmail(email);

    if (isExists) {
      throw new Error('User already exists');
    }

    const userId = uuidv4();
    users[userId] = { ...userData, userId };

    await fs.writeFile(this.#filePath, JSON.stringify(users));

    return true;
  }

  async getUserByEmail(userEmail) {
    const users = await this.#readUsers();
    const user = Object.values(users).find(({ email }) => email === userEmail);

    return user;
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

    return users.map(UsersDto);
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
      console.error(e);
      throw new Error(`Error deleting user: ${e.message}`);
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
