import bcrypt from 'bcrypt';
import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';

export function authService() {
  const userService = diContainer.resolve(SERVICES.users);
  const userDao = userService.userDao;

  async function authorizeUser(username, userPassword) {
    const { password } = await userDao.getUserByUsername(username);
    const isPassEqual = await bcrypt.compare(userPassword, password);

    return isPassEqual;
  }

  return {
    authorizeUser,
  };
}
