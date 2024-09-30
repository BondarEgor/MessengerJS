import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { PATHS } from '../constants.js';
import { v4 as uuid } from 'uuid';
import { chatsMapper } from '../dto/chatsDto.mjs';

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

export class ChatDao {
  #filePath = path.join(_dirname, '../data', PATHS.chats);

  async createChat(userId, chatData) {
    const chats = await this.#readChats();

    if (!(userId in chats)) {
      chats[userId] = {};
    }

    const chatId = uuid();

    if (!(chatId in chats[userId])) {
      throw new Error(`Chat with id ${chatId} exists`);
    }

    chats[userId] = {
      ...chats[userId],
      [chatId]: {
        ...chatData,
        chatId,
      },
    };

    await this.#writeChats(chats);

    return chatsMapper(chats[userId][chatId]);
  }

  async canUserDeleteChat(userId, chatId) {
    const userHasExactChat = await this.doesChatExist(userId, chatId);

    return userHasExactChat;
  }

  async deleteChatById(userId, chatId) {
    const chats = await this.#readChats();
    const chatExists = await this.getChatByIdentifier(userId, chatId);

    if (!chatExists) {
      throw new Error('Chat does not exist');
    }

    return chatsMapper(chats[userId][chatId], 'delete');
  }

  async updateChat(userId, chatId, updateData) {
    const chats = await this.#readChats();
    const userHasChatWithId = await this.getChatByIdentifier(userId, chatId);

    if (!userHasChatWithId) {
      throw new Error('Chat not found');
    }

    chats[chatId] = {
      ...chats[chatId],
      ...updateData,
    };

    await this.#writeChats(chats);

    return chatsMapper(currChat, 'update');
  }

  async getChatByChatId(userId, chatId) {
    const chats = await this.#readChats();
    const userHasChatWithId = await this.getChatByIdentifier(userId, chatId);

    if (!userHasChatWithId) {
      throw new Error('Chat not found');
    }

    return chatsMapper(chats[userId][chatId]);
  }

  async getAllChats(userId) {
    const chats = await this.#readChats();
    const userHasChats = userId in chats;

    return userHasChats ? chats[userId] : null;
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

  async doesChatExist(userId, chatId) {
    const chats = await this.#readChats();
    const userHasChats = userId in chats;
    const userHasChatWithId = chatId in chats[userId];

    return userHasChats && userHasChatWithId;
  }

  async getChatByIdentifier(userId, identifier) {
    const chats = await this.#readChats();
    const userHasChats = userId in chats;

    if (!userHasChats) {
      throw new Error('User dont have any chats');
    }

    return Object.values(chats[userId]).some(
      ({ chatId, name }) => chatId === identifier || name === identifier
    );
  }
}
