import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { PATHS } from '../constants.js';
import { v4 as uuid } from 'uuid';

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

export class ChatDao {
  #filePath = path.join(_dirname, '../data', PATHS.chats);

  async createChat(chatData) {
    const chats = await this.#readChats();
    const { name } = chatData;
    const isChatCreated = this.doesChatExist(chats, name);

    if (isChatCreated) {
      throw new Error('Chat already exists');
    }

    const uniqueId = uuid();

    chats[uniqueId] = chatData;

    return await this.#writeChats(chats);
  }

  async #readChats() {
    try {
      const data = await fs.readFile(this.#filePath, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      console.error(e)
      await fs.writeFile(this.#filePath, JSON.stringify({}));

      throw e
    }
  }

  async #writeChats(chats) {
    try {
      await fs.writeFile(this.#filePath, JSON.stringify(chats, null, 2));

      return true;
    } catch (e) {
      console.error(e)

      return false;
    }
  }

  doesChatExist(chats, chatName) {
    return !!Object.values(chats).some((chat) => chat.name === chatName);
  }

  async deleteChatById(chatId) {
    const chats = await this.#readChats();
    const isChatPresent = !!chats[chatId];

    if (!isChatPresent) {
      throw new Error('Chat not found');
    }

    delete chats[chatId];

    return await this.#writeChats(chats);
  }

  async updateChat(chatId, updateData) {
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

  async ChatById(chatId) {
    const chats = await this.#readChats();
    const isChatPresent = !!chats[chatId];

    if (!isChatPresent) {
      throw new Error('Chat not found');
    }

    return chats[chatId];
  }

  async getAllChats() {
    return await this.#readChats()
  }
}
