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
    const { name } = chatData;
    const userHasChats = userId in chats;

    if (userHasChats) {
      const chatWithSameNameExists = Object.values(chats[userId]).some(
        (chat) => name === chat.name
      );

      if (chatWithSameNameExists) {
        throw new Error('Chat already exists');
      }
    }

    const chatId = uuid();
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
    const userHasChats = userId in chats;

    if (!userHasChats) {
      throw new Error(`No user with id ${userId} found`);
    }

    const userHasChatWithId = chatId in chats[userId];

    if (!userHasChatWithId) {
      throw new Error(`No chat with id ${chatId} found`);
    }

    const currChat = chats[userId][chatId];

    return chatsMapper(currChat, 'delete');
  }

  async updateChat(userId, chatId, updateData) {
    const chats = await this.#readChats();

    try {
      const userHasChatWithId = await this.doesChatExist(userId, chatId);

      if (userHasChatWithId) {
        chats[chatId] = {
          ...chats[chatId],
          ...updateData,
        };
      }
    } catch (error) {
      console.error(error);
      throw new Error('Chat not found');
    }

    await this.#writeChats(chats);

    return chatsMapper(currChat, 'update');
  }

  async getChatByChatId(userId, chatId) {
    const chats = await this.#readChats();
    const userHasChatWithId = await this.doesChatExist(userId, chatId);

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
}
