import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';
import EventEmitter from 'node:events';

export class MessageService {
  constructor() {
    this.messagesDao = diContainer.resolve(SERVICES.messagesDao);
    this.eventEmitter = new EventEmitter();
    this.subscribers = {}
  }
  
  async createMessage(messageData) {
    const { chatId } = messageData
    notifyAll(chatId);

    return await messagesDao.createMessage(messageData);
  }

   createMessageStream(chatId, sub) {
    if (!subscribers[chatId]) {
      subscribers[chatId] = []
    }

    subscribers[chatId].push(sub)

    eventEmitter.on(`messages-${chatId}`, (messages) => {
      subscribers[chatId].forEach(sub => {
        sub.write(`data: ${JSON.stringify(messages)}`)
      })
    })
  }

  async  getMessagesByChatId(chatId) {
    return await messagesDao.getMessagesByChatId(chatId);
  }

  async  getMessageById(chatId, messageId) {
    return await messagesDao.getMessageById(chatId, messageId);
  }

  async  updateMessageById(chatId, messageId, content) {
    notifyAll(chatId);

    return await messagesDao.updateMessageById(chatId, messageId, content);
  }

  async  notifyAll(chatId) {
    eventEmitter.emit(`messages-${chatId}`, await getMessagesByChatId(chatId));
  }

  async  deleteMessageById(chatId, messageId) {
    notifyAll(chatId);

    return await messagesDao.deleteMessageById(chatId, messageId);
  }

   unsubscribe(chatId, res) {
    if (!subscribers[chatId]) {
      return
    }

    subscribers[chatId] = subscribers[chatId].filter(sub => sub !== res)

    if (subscribers[chatId].length === 0) {
      delete subscribers[chatId]
    }
  }

  //Теоритически может быть полезным, поэтому сразу реализовал
   unsubscribeAll(chatId) {
    if (!subscribers[chatId]) {
      return
    }

    subscribers[chatId].forEach(sub => {
      sub.write('DISCONNECTED')
      sub.end()
    })

    delete subscribers[chatId]

    eventEmitter.removeAllListeners(`messages-${chatId}`)
  }

  //Метод, если понадобится отписаться от всех чатов
   unsubscribeAllChats() {
    for (const chatId in subscribers) {
      unsubscribe(chatId)
    }
  }
}
