import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';

export class UsersService {
  constructor() {
    this.userDao = diContainer.resolve(SERVICES.userDao);
  }

  async getUser(userId) {
    return await userDao.getUser(userId);
  }

  async updateUser(userData, userId) {
    return await userDao.updateUser(userData, userId);
  }

  async deleteUserById(userId) {
    return await userDao.deleteUserById(userId);
  }

  async getAllUsers() {
    return await userDao.getAllUsers();
  }
}
