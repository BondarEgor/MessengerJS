export class SseService {
  constructor() {
    this.clients = [];
  }

  addClient = (client) => {
    this.clients.push(client);
  };

  removeClient = (client) => {
    this.clients = this.clients.filter((c) => c !== client);
  };

  sendEvent = (data) => {
    this.clients.forEach((client) => {
      client.write(JSON.stringify(data));
    });
  };
}
