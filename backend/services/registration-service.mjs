import bcrypt from 'bcrypt';
import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';

export function registrationService() {
  const userDao = diContainer.resolve(SERVICES.userDao);

  async function getUserByName(username) {
    return await userDao.getUserByName(username);
  }

  async function registerNewUser(userInfo) {
    const { password } = userInfo;
    const hashedPassword = await hashPassword(password);

    const userData = {
      ...userInfo,
      password: hashedPassword,
      statusId: 'client',
      roleId: 'user',
    };

    return await userDao.createUser(userData);
  }

  return {
    registerNewUser,
    getUserByName,
  };
}

export async function hashPassword(password) {
  const saltRounds = 10;
  const salt = await bcrypt.genSaltSync(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}
