import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { ONE_DAY, PATHS } from '../constants.js';
import bcrypt from 'bcrypt';

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

export class SessionDao {
  #filePath = path.join(_dirname, '../data', PATHS.sessions);

  async #readSessions() {
    try {
      const data = await fs.readFile(this.#filePath, 'utf-8');

      return JSON.parse(data);
    } catch (error) {
      const directoryPath = path.dirname(this.#filePath);

      await fs.mkdir(directoryPath, { recursive: true });
      await fs.writeFile(this.#filePath, JSON.stringify({}));

      throw error;
    }
  }

  async generateSessionInfo(user) {
    const sessions = await this.#readSessions();
    const { userId } = user;
    const existingSession = Object.values(sessions).find(
      (session) => session.userId === userId
    );

    if (existingSession) {
      return sessions[existingSession.token];
    }

    const token = await this.generateToken(user);
    const refreshToken = await this.generateToken(user);

    return await this.createSession({
      userId,
      token,
      refreshToken,
      expirationTime: new Date().getTime() + ONE_DAY,
    });
  }

  async generateToken(userData) {
    const combinedValues = Object.values(userData).join('-');
    const saltRounds = 10;

    return await bcrypt.hash(combinedValues, saltRounds);
  }

  async isUserIdValid(userId) {
    const sessions = await this.#readSessions();

    return Object.values(sessions).some((session) => session.userId === userId);
  }

  async isTokenValid(token) {
    const isTokenExist = await this.isTokenExist(token);

    if (!isTokenExist) {
      throw new Error('Token does not exist');
    }

    const isTokenExpired = this.isTokenFresh(token);

    if (isTokenExpired) {
      const { refreshToken } = await this.getSessionByToken(token);

      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      return await this.updateSession(token);
    }

    return true
  }

  async isTokenExist(token) {
    const sessions = await this.#readSessions()

    if (!(token in sessions)) {
      throw new Error('Token does not exist for this session')
    }

    return true
  }
  isTokenFresh({ expirationTime }) {
    const currentTime = new Date().getTime();

    if (expirationTime < currentTime) {
      throw new Error('Token is expired');
    }

    return false;
  }

  async createSession(sessionData) {
    const sessions = await this.#readSessions();
    const { token } = sessionData;

    if (sessions[token]) {
      return sessions[token];
    }

    sessions[token] = sessionData;
    await this.#writeSessions(sessions);

    return sessions[token];
  }

  async #writeSessions(sessions) {
    try {
      await fs.writeFile(this.#filePath, JSON.stringify(sessions, null, 2));

      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async updateSession(token) {
    const sessions = await this.#readSessions();

    if (!(token in sessions)) {
      throw new Error('User not registered');
    }

    const sessionInfo = sessions[token];
    const newToken = await this.generateToken(sessionInfo);
    const refreshToken = await this.generateToken(sessionInfo);

    const updatedSessinInfo = {
      ...sessionInfo,
      token: newToken,
      refreshToken,
      expirationTime: new Date().getTime() + ONE_DAY,
    };
    delete sessions[token];

    sessions[newToken] = updatedSessinInfo;
    await this.#writeSessions(sessions);

    return sessions[newToken];
  }

  async getSessionByToken(token) {
    const sessions = await this.#readSessions();
    const isSessionExist = token in sessions;

    if (!isSessionExist) {
      throw new Error('No session found');
    }

    return sessions[token];
  }

  async deleteSessionById(userId) {
    const sessions = await this.#readSessions();
    const deletedSession = delete sessions[userId];
    await this.#writeSessions(sessions);

    return deletedSession;
  }
}
