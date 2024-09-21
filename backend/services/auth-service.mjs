import bcrypt from 'bcrypt';
import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';

export function authService() {
  const registrationService = diContainer.resolve(SERVICES.registration);

  async function authorizeUser(email, userPassword) {
    try {
      const user = await registrationService.getUser(email);

      if (!user) {
        throw new Error('User is not registered');
      }

      const isPassEqual = await isPasswordCorrect(userPassword, user.password);

      if (!isPassEqual) {
        throw new Error('Password not valid');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  async function isPasswordCorrect(userPassword, hashedPassword) {
    return await bcrypt.compare(userPassword, hashedPassword);
  }
  return {
    authorizeUser,
  };
}
