import { ONE_DAY } from '../constants.js';
import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';
import bcrypt from 'bcrypt';

export function sessionService() {
  const sessionDao = diContainer.resolve(SERVICES.sessionsDao);

  async function isTokenValid(token){
    const { authToken, expireDate }= await sessionDao.isTokenValid(token)

    if(!authToken || !expireDate > Date.now()){
      throw new Error('Try to login')
    }

    return true
  }

  async function generateSessionInfo(user) {
    const { userId } = user;

    const existingSession = await sessionDao.getSessionByUserId(userId);
    const currentTime = new Date().getTime();

    if (existingSession) {
      if (existingSession.expireDate > currentTime) {
        return existingSession;
      }

      if (existingSession.refreshToken) {
        return await updateSessionInfo(user);
      } else {
        throw new Error('No refresh Token');
      }
    }

    const authToken = await generateToken(user);
    const expireDate = generateExpireDate();
    const refreshToken = await generateRefreshToken(authToken);

    const sessionData = {
      userId,
      authToken,
      expireDate,
      refreshToken,
    };

    return (await sessionDao.createSession(sessionData)) ? sessionData : null;
  }

  function generateExpireDate() {
    const currentDate = new Date().getTime();
    return currentDate + ONE_DAY;
  }

  async function updateSessionInfo(user) {
    const { userId } = user;
    const newAuthToken = await generateToken(user);
    const newRefreshToken = await generateRefreshToken(newAuthToken);
    const newExpireDate = generateExpireDate();

    const updatedSessionInfo = {
      authToken: newAuthToken,
      refreshToken: newRefreshToken,
      expireDate: newExpireDate,
    };

    return sessionDao.updateSession(userId, updatedSessionInfo);
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
