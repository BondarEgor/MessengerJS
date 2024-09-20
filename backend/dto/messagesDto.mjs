export class MessagesDto {
  constructor(message, isDeleted = false) {
    this.author = message.author;
    this.content = message.content;
    this.timeStamp = message.timeStamp;
    this.id = message.id;
    this.status = isDeleted ? 'deleted' : 'active';
  }
}
