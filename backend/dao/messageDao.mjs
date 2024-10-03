import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { PATHS } from '../constants.js';
import { v4 as uuid } from 'uuid';
import { messagesMapper } from '../dto/messagesDto.mjs';
import { messageStatusMapping } from '../dto/constants.mjs';

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

export class MessagesDao {
  #filePath = path.join(_dirname, '../data', PATHS.messages);

  async getMessagesByChatId(chatId) {
    const messages = await this.#readMessages();
    const isChatExisting = chatId in messages;

    if (!isChatExisting) {
      throw new Error(`Chat with id: ${chatId} does not exist`);
    }

    return Object.values(messages[chatId]).map(messagesMapper);
  }

  async getMessageByMessageId(chatId, messageId) {
    const messages = await this.#readMessages();
    const chatHasMessage = await this.#doesMessageExist(chatId, messageId);

    if (!chatHasMessage) {
      throw new Error('Message with this id does not exist');
    }

    return messagesMapper(messages[chatId][messageId]);
  }

  async updateMessageById(chatId, messageId, content) {
    const messages = await this.#readMessages();
    const chatHasMessage = await this.#doesMessageExist(chatId, messageId);

    if (!chatHasMessage) {
      throw new Error('Message with this id does not exist');
    }

    messages[chatId][messageId] = {
      ...messages[chatId][messageId],
      content,
    };

    const isWritten = await this.#writeMessages(messages);

    if (!isWritten) {
      throw new Error('Error while writting into a file');
    }

    return userMapper(messages[chatId][messageId], 'update');
  }

  async deleteMessageById(chatId, messageId) {
    const messages = await this.#readMessages();
    const chatHasMessage = await this.#doesMessageExist(chatId, messageId);

    if (!chatHasMessage) {
      throw new Error('Message with this id does not exist');
    }

    return messagesMapper(
      messages[chatId][messageId],
      messageStatusMapping.delete
    );
  }

  async createMessage(chatId, messageData) {
    const messages = await this.#readMessages();
    const messageId = uuid();
    /*Такая обработка поможет избежать дублирования идентификаторов сообщений
     * И если юзер поймает ошибку, то при повторном создании сообщения будет сгенерен новый id
     */
    const messageWithSameId = Object.values(messages).some(
      (message) => message.messageId === messageId
    );

    if (messageWithSameId) {
      throw new Error(`Message with id: ${messageId} already exists`);
    }
    const newMessage = {
      ...messageData,
      timeStamp: new Date(),
      messageId,
    };

    messages[chatId] = [...messages[chatId], newMessage];
    //FIXME: Нужно ли тут таким образом проверять?
    const isWritten = await this.#writeMessages(messages);

    if (!isWritten) {
      throw new Error('Error while writting into a file');
    }

    return messagesMapper(newMessage);
  }

  async #readMessages() {
    try {
      const messages = await fs.readFile(this.#filePath, 'utf-8');

      return JSON.parse(messages);
    } catch (error) {
      const directoryPath = path.dirname(this.#filePath);

      await fs.mkdir(directoryPath, { recursive: true });
      await fs.writeFile(this.#filePath, JSON.stringify({}));

      throw error;
    }
  }

  async #writeMessages(messages) {
    try {
      await fs.writeFile(this.#filePath, JSON.stringify(messages, null, 2));

      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async #doesMessageExist(chatId, messageId) {
    const messages = await this.#readMessages();
    const isChatExisting = chatId in messages;
    const doesMessageExistInChat = messageId in messages[chatId];

    return isChatExisting && doesMessageExistInChat;
  }
}
