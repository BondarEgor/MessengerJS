const statusMapping = {
  delete: 'deleted',
  update: 'updated',
  default: 'active',
};

function getStatus(status) {
  return statusMapping[status] || statusMapping.default;
}
export class ChatsDto {
  constructor(chat, status) {
    this.status = getStatus(status);
    this.name = chat.name;
    this.description = chat.description;
    this.type = chat.type;
  }
}
