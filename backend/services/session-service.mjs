import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';

export function sessionService() {
  const sessionDao = diContainer.resolve(SERVICES.sessionsDao);

  async function isTokenValid(token) {
    return await sessionDao.isTokenValid(token);
  }

  async function generateSessionInfo(user) {
    return sessionDao.generateSessionInfo(user);
  }

  async function getSessionByToken(token) {
    return await sessionDao.getSessionByToken(token);
  }

  return {
    generateSessionInfo,
    isTokenValid,
    getSessionByToken,
  };
}
