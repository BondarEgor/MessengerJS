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
    const userHasChats = userId in chats;

    if (!userHasChats) {
      chats[userId] = {};
    }

    const chatId = uuid();
    const isChatWithSameId = chatId in chats[userId];

    if (isChatWithSameId) {
      throw new Error(`Chat with id ${chatId} exists`);
    }

    chats[userId] = {
      ...chats[userId],
      [chatId]: {
        ...chatData,
        chatId,
      },
    };

    const isWritten = await this.#writeChats(chats);

    if (!isWritten) {
      throw new Error('Failed to write chats');
    }

    return chatsMapper(chats[userId][chatId]);
  }

  async canUserDeleteChat(userId, chatId) {
    return await this.doesChatExist(userId, chatId);
  }

  async softDeleteChatById(userId, chatId) {
    const chats = await this.#readChats();
    const isChatExisting = await this.doesChatExist(userId, chatId);

    if (!isChatExisting) {
      throw new Error('Chat does not exist');
    }

    return chatsMapper(chats[userId][chatId], 'delete');
  }

  async hardDeleteChatById(userId, chatId) {
    const chats = await this.#readChats();
    const isChatExisting = await this.doesChatExist(userId, chatId);

    if (!isChatExisting) {
      throw new Error('Chat does not exist');
    }

    delete chats[userId][chatId];

    const isWritten = await this.#writeChats(chats);

    if (!isWritten) {
      throw new Error('Error while writting chats');
    }

    return true;
  }

  async restoreChatById(userId, chatId) {
    const chats = await this.#readChats();
    const isChatExisting = await this.doesChatExist(userId, chatId);

    if (!isChatExisting) {
      throw new Error('Chat not found');
    }

    return chatsMapper(chats[userId][chatId], 'active');
  }

  async updateChat(userId, chatId, updateData) {
    const chats = await this.#readChats();
    const isChatExisting = await this.doesChatExist(userId, chatId);

    if (!isChatExisting) {
      throw new Error('Chat not found');
    }

    chats[chatId] = {
      ...chats[chatId],
      ...updateData,
    };

    const isWritten = await this.#writeChats(chats);

    if (!isWritten) {
      throw new Error('Failed to write chats');
    }

    return chatsMapper(chats[userId][chatId], 'update');
  }

  async getChatByChatId(userId, chatId) {
    const chats = await this.#readChats();
    const isChatExisting = await this.doesChatExist(userId, chatId);

    if (!isChatExisting) {
      throw new Error('Chat not found');
    }

    return chatsMapper(chats[userId][chatId]);
  }

  async getAllChats(userId) {
    const chats = await this.#readChats();
    const userHasChats = userId in chats;

    return userHasChats ? Object.values(chats[userId]).map(chatsMapper) : null;
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
