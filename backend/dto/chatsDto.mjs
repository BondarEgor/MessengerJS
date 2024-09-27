import { chatStatusMapping } from './constants.mjs'

function getChatStatus(status) {
  return chatStatusMapping[status] || chatStatusMapping.default
}

export function chatsMapper({ name, description, type }, status) {
  return {
    status: getChatStatus(status),
    name,
    description,
    type
  }
}