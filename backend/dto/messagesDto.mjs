const statusMapping = {
  delete: 'deleted',
  update: 'updated',
  default: 'active',
};

const getStatus = (status) => {
  return statusMapping[status] || statusMapping.default;
};
export class MessagesDto {
  constructor(message, status) {
    this.author = message.author;
    this.content = message.content;
    this.timeStamp = message.timeStamp;
    this.id = message.id;
    this.status = getStatus(status);
  }
}
