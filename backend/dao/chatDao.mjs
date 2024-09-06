import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { PATHS } from '../constants.js';
import { v4 as uuid } from 'uuid';

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

export class ChatDao {
  #filePath = path.join(_dirname, '../data', PATHS.chats);

  async createChat(userId, chatData) {
    const { name } = chatData;
    const isChatCreated = await this.doesChatExist(name, userId);

    if (isChatCreated) {
      throw new Error('Chat already exists');
    }

    const chatId = uuid()
    chats[userId][chatId] = chatData;

    return await this.#writeChats(chats);
  }

  async #readChats() {
    try {
      const data = await fs.readFile(this.#filePath, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
      await fs.writeFile(this.#filePath, JSON.stringify({}));

      throw e;
    }
  }

  async #writeChats(chats) {
    try {
      await fs.writeFile(this.#filePath, JSON.stringify(chats, null, 2));

      return true;
    } catch (e) {
      console.error(e);

      return false;
    }
  }

  async doesChatExist(chatName, userId) {
    const chats = await this.#readChats()

    return !!Object.values(chats[userId]).some((chat) => chat.name === chatName);
  }

  async deleteChatById(userId, chatId) {
    const chats = await this.#readChats();
    const isChatPresent = !!chats[userId][chatId];

    if (!isChatPresent) {
      throw new Error('Chat not found');
    }

    delete chats[userId][chatId];

    return await this.#writeChats(chats);
  }

  async updateChat(userId, chatId, updateData) {
    const chats = await this.#readChats();
    const isChatPresent = !!chats[chatId];

    if (!isChatPresent) {
      throw new Error('Chat not found');
    }

    chats[chatId] = {
      ...chats[chatId],
      ...updateData,
    };

    return await this.#writeChats(chats);
  }

  async chatById(chatId) {
    const chats = await this.#readChats();
    const isChatPresent = !!chats[chatId];

    if (!isChatPresent) {
      throw new Error('Chat not found');
    }

    return chats[chatId];
  }

  async getAllChats() {
    return await this.#readChats();
  }
}
