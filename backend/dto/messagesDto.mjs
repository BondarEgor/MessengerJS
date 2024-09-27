import { messageStatusMapping } from "./constants.mjs";

function getMessageStatus(status) {
  return messageStatusMapping[status] || messageStatusMapping.default
}

export function messagesMapper({ content, timeStamp, author, id }, status) {
  return {
    content,
    timeStamp,
    id,
    author,
    status: getMessageStatus(status)
  }
}