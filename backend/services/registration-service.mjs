import bcrypt from 'bcrypt';
import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';

export function registrationService() {
  const userDao = diContainer.resolve(SERVICES.userDao);

  async function registerUser(username, password, email) {
    try {
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
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  return { getRegisteredUser: registerUser };
}

async function hashPassword(password) {
  const saltRounds = 10;
  const salt = await bcrypt.genSaltSync(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}
