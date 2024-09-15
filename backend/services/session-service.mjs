import { ONE_DAY } from '../constants.js';
import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export function sessionService() {
  const sessionDao = diContainer.resolve(SERVICES.sessionsDao);

  async function isTokenValid(token) {
    return await sessionDao.isTokenValid(token);
  }

  async function generateSessionInfo(user) {
    const { userId } = user;
    const token = generateToken(user)

    const sessionData = {
      userId,
      token,
      refreshToken: await generateRefreshToken(userId),
    };

    return (await sessionDao.createSession(sessionData)) ? sessionData : null;
  }

  function generateToken({ username, userId, email }) {
    return jwt.sign({ username, userId, email }, process.env.JWT_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXP })
  }


  async function generateRefreshToken(tokenToRefresh) {
    const saltRounds = 10;
    const refreshToken = await bcrypt.hash(tokenToRefresh, saltRounds);

    return refreshToken;
  }

  return {
    generateSessionInfo,
    isTokenValid,
  };
}
