import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { PATHS } from '../constants.js';
import { v4 as uuid } from 'uuid';
import { ChatsDto } from '../dto/chatsDto.mjs';

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

export class ChatDao {
  #filePath = path.join(_dirname, '../data', PATHS.chats);

  async createChat(userId, chatData) {
    const chats = await this.#readChats();
    const { name } = chatData;

    if (chats[userId]) {
      const isChatPresent = Object.values(chats[userId]).some(
        (chat) => name === chat.name
      );

      if (isChatPresent) {
        throw new Error('Chat already exists');
      }
    }

    const chatId = uuid();
    chats[userId] = {
      ...chats[userId],
      [chatId]: {
        ...chatData,
      },
    };

    return await this.#writeChats(chats);
  }

  async #readChats() {
    try {
      const data = await fs.readFile(this.#filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      const directoryPath = path.dirname(this.#filePath);

      await fs.mkdir(directoryPath, { recursive: true });
      await fs.writeFile(this.#filePath, JSON.stringify({}));

      throw error;
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
    const isUserPresent = userId in chats;

    if (!isUserPresent) {
      throw new Error('No user found');
    }

    const isChatPresent = Object.keys(chats[userId]).find(
      (chatId) => chatId == id
    );

    if (!isChatPresent) {
      throw new Error('No chat found');
    }

    return true;
  }

  async isDeleteAllowed(userId, chatId) {
    try {
      const isChatPresent = await this.#doesChatExist(userId, chatId);

      if (!isChatPresent) {
        throw new Error('Delete not allowed');
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  async deleteChatById(userId, chatId) {
    const chats = await this.#readChats();

    if ((!userId in chats)) {
      throw new Error(`No user with id ${userId} found`)
    }

    if ((!chatId in chats[userId])) {
      throw new Error(`No chat with id ${chatId} found`)
    }

    const currChat = chats[userId][chatId]

    return new ChatsDto(currChat, true)
  }

  async restoreChatById(userId, chatId) {
    const chats = await this.#readChats();
    const isChatPresent = await this.#doesChatExist(userId, chatId);

    if (isChatPresent) {
      let currentChat = chats[userId][chatId];

      chats[userId][chatId] = currentChat;
    }

    await this.#writeChats(chats);

    return chats[userId][chatId];
  }

  async updateChat(userId, chatId, updateData) {
    const chats = await this.#readChats();

    try {
      const isChatPresent = await this.#doesChatExist(userId, chatId);

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
    const isChatPresent = await this.#doesChatExist(userId, chatId);

    if (!isChatPresent) {
      throw new Error('Chat not found');
    }

    return chats[userId][chatId];
  }

  async getAllChats() {
    return await this.#readChats();
  }
}
