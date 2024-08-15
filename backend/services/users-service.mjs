import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';

export function usersService() {
  const userDao = diContainer.resolve(SERVICES.userDao);

  async function getUserById(userId) {
    return await userDao.getUserById(userId);
  }

  async function updateUser(userData, userId) {
    return await userDao.updateUser(userData, userId);
  }

  async function deleteUserById(userId) {
    return await userDao.deleteUserById(userId);
  }

  async function getAllUsers() {
    return await userDao.getAllUsers();
  }

  async function getUserStatus() {
    return await userDao.getUserStatus();
  }

  return {
    getUserById,
    updateUser,
    deleteUserById,
    getAllUsers,
    getUserStatus,
  };
}
