import { chatStatusMapping } from './constants.mjs';

function getChatStatus(status) {
  return chatStatusMapping[status] || chatStatusMapping.default;
}

export function chatsMapper({ chatId, name, description, type }, status) {
  return {
    status: getChatStatus(status),
    chatId,
    name,
    description,
    type,
  };
}
