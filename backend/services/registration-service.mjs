import bcrypt from 'bcrypt';
import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';

export function userService() {
  const userDao = diContainer.resolve(SERVICES.userDao);

  async function getUserByName(username) {
    return await userDao.getUserByName(username);
  }

  async function registerNewUser(username, password, email) {
    if (!username || !password || !email) {
      throw new Error('Provide all the fields');
    }

    const hashedPassword = await hashPassword(password);

    const userData = {
      username,
      password: hashedPassword,
      email,
    };

    const newUser = await userDao.createUser(userData);

    if (newUser) {
      return true;
    } else {
      throw new Error(error);
    }
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
