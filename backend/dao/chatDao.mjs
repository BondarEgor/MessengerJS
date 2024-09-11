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
    const isChatPresent = Object.values(chats).some(chat => chat.name === name);

    if (isChatPresent) {
      throw new Error('Chat already exists');
    }
    const chats = await this.#readChats()

    const chatId = uuid();
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

  async #doesChatExist(userId, id) {
    const chats = await this.#readChats();
    const isUserPresent = userId in chats

    if (!isUserPresent) {
      return false
    }

    return !!Object.values(chats[userId]).some(
      ({ chatId }) => chatId === id
    );
  }


  async deleteChatById(userId, chatId) {
    const chats = await this.#readChats();
    const isChatPresent = await this.#doesChatExist(userId, chatId);

    if (isChatPresent) {
      throw new Error('Chat not found');
    }

    const updatedChats = { ...chats }
    delete updatedChats[userId][chatId];

    return updatedChats
  }

  async updateChat(userId, chatId, updateData) {
    try {
      const chats = await this.#readChats();
      const isChatPresent = await this.#doesChatExist(userId, chatId)

      if (isChatPresent) {
        chats[chatId] = {
          ...chats[chatId],
          ...updateData,
        };
      }
    } catch (error) {
      console.error(error);
      throw new Error('Chat not found');
    }

    return await this.#writeChats(chats);
  }

  async getChatById(userId, chatId) {
    const chats = await this.#readChats();
    const isChatPresent = await this.#doesChatExist(userId, chatId)

    if (!isChatPresent) {
      throw new Error('Chat not found');
    }

    return chats[userId][chatId];
  }

  async getAllChats() {
    return await this.#readChats();
  }
}
