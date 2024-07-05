import { ONE_DAY } from '../constants.js';
import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';
import bcrypt from 'bcrypt';

export function sessionService() {
  const sessionDao = diContainer.resolve(SERVICES.sessionsDao);

  async function generateSessionInfo(user) {
    const currentDate = new Date().getTime();
    const authToken = await generateToken(user);
    const expireDate = currentDate + ONE_DAY;
    const refreshToken = await generateRefreshToken(authToken);

    const sessionData = {
      authToken,
      expireDate,
      refreshToken,
    };

    return (await sessionDao.createSession(sessionData)) ? sessionData : null;
  }

  async function generateToken(data) {
    const combinedValues = Object.values(data).join('-');
    const saltRounds = 10;
    const token = await bcrypt.hash(combinedValues, saltRounds);

    return token;
  }

  async function generateRefreshToken(tokenToRefresh) {
    const saltRounds = 10;
    const refreshToken = await bcrypt.hash(tokenToRefresh, saltRounds);

    return refreshToken;
  }

  return {
    generateSessionInfo,
  };
}
