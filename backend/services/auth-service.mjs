import bcrypt from 'bcrypt';
import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';

export function authService() {
  const registrationService = diContainer.resolve(SERVICES.registration);
  const sessionService = diContainer.resolve(SERVICES.sessions);

  async function authorizeUser(username, userPassword) {
    try {
      const user = await registrationService.getUserByName(username);

      if (!user) {
        throw new Error('User is not registered');
      }
      
      const isPassEqual = await isPasswordCorrect(userPassword, user.password);
      
      if (isPassEqual) {
        const sessionInfo = await sessionService.generateSessionInfo(user);

        return sessionInfo;
      } else {
        throw new Error('Password not valid');
      }
    } catch (e) {
      console.error(e)
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
