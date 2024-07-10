export class DataTransferObject {
  constructor(data = null) {
    this.username = data?.username;
    this.status = data?.status || 'client';
    this.role = data?.role || 'user';
    this.userId = data?.userId;
    this.email = data?.email;
  }
}
