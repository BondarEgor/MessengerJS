import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';

export function usersService() {
  const userDao = diContainer.resolve(SERVICES.userDao);

  async function getUserById(userId) {
    return await userDao.getUserById(userId);
  }

  async function updateUser(userData, token) {
    return await userDao.updateUser(userData, token);
  }

  async function deleteUserById(userId) {
    return await userDao.deleteUserById(userId);
  }

	async function getAllUsers() {
		return await userDao.getAllUsers()
	}

  return {
    getUserById,
    updateUser,
    deleteUserById,
		getAllUsers
  };
}
