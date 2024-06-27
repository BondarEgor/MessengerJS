import bcrypt from 'bcrypt';
import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';

export function authService() {
  const userDao = diContainer.resolve(SERVICES.userDao);

  async function authorizeUser(username, userPassword) {
    try {
      const { password } = await userDao.getUser(username);
      const isPassEqual = await bcrypt.compare(userPassword, password);

      if (isPassEqual) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      throw new Error(e);
    }
  }

  return {
    isAuthenticated: authorizeUser,
  };
}
