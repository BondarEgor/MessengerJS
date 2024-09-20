export class ChatsDto {
  constructor(chat, isDeleted) {
    this.status = isDeleted ? 'deleted' : 'active';
    this.name = chat.name;
    this.description = chat.description;
    this.type = chat.type;
  }
}
