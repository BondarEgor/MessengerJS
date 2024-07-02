import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';
import { hashPassword } from './registration-service.mjs';

export function sessionService() {
  const sessionDao = diContainer.resolve(SERVICES.sessionsDao);
  const userService = diContainer.resolve(SERVICES.users);
  const authService = diContainer.resolve(SERVICES.authorization);

  async function generateSessionInfo(username, password) {
    const isAuthSuccess = await authService.authorizeUser(username, password);

    if (!isAuthSuccess) {
      throw new Error('Authorization error');
    }

    const hashedPassword = await hashPassword(password);
    const currentDate = new Date().getTime();
    const expireDate = calculateExpireDate(currentDate);
    const { userId } = await userService.getUserByName(username);

    const sessionInfo = {
      username,
      password: hashedPassword,
      currentDate,
      userId,
      expireDate,
    };

    const newSession = await sessionDao.createSession(sessionInfo);

    return newSession ? sessionInfo : null;
  }

  function calculateExpireDate(currentDate) {
    const expireDate = currentDate + 1000 * 60 * 60 * 24;
    return expireDate;
  }

  return {
    generateSessionInfo,
  };
}
