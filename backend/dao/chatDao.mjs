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

    if (userId in chats) {
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
        chatId
      },
    };

    await this.#writeChats(chats);

    return chatsMapper(chats[userId][chatId])
  }

  async canUserDeleteChat(userId, chatId) {
    //Тут как будто нужно поменять название переменной, но пока сделал так
    const isChatPresent = await this.doesChatExist(userId, chatId)

    return isChatPresent
  }

  async deleteChatById(userId, chatId) {
    const chats = await this.#readChats();

    if ((!userId) in chats) {
      throw new Error(`No user with id ${userId} found`);
    }

    if ((!chatId) in chats[userId]) {
      throw new Error(`No chat with id ${chatId} found`);
    }

    const currChat = chats[userId][chatId];

    return chatsMapper(currChat, 'delete');
  }

  async updateChat(userId, chatId, updateData) {
    const chats = await this.#readChats();

    try {
      const isChatPresent = await this.doesChatExist(userId, chatId);

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

    await this.#writeChats(chats);

    return chatsMapper(currChat, 'update');
  }

  async getChatByChatId(userId, chatId) {
    const chats = await this.#readChats();
    const isChatPresent = await this.doesChatExist(userId, chatId);

    if (!isChatPresent) {
      throw new Error('Chat not found');
    }

    return chatsMapper(chats[userId][chatId]);
  }

  async getAllChats(userId) {
    const chats = await this.#readChats()
    const isUserPresent = userId in chats

    return isUserPresent ? chats[userId] : null
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

  async doesChatExist(userId, chatIdentifier) {
    const chats = await this.#readChats();
    const isChatPresent = userId in chats && Object.values(chats[userId]).some(chat => Object.values(chat).some(prop => prop === chatIdentifier))

    if (!isChatPresent) {
      throw new Error('Chat not found')
    }

    return isChatPresent
  }
}
