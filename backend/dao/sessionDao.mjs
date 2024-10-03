import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { ONE_DAY, PATHS } from '../constants.js';
import bcrypt from 'bcrypt';

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

export class SessionDao {
  #filePath = path.join(_dirname, '../data', PATHS.sessions);

  async createSession(sessionData) {
    const sessions = await this.#readSessions();
    const { token } = sessionData;
    const sessionHasToken = token in sessions;

    if (sessionHasToken) {
      return sessions[token];
    }

    sessions[token] = sessionData;
    await this.#writeSessions(sessions);

    return sessions[token];
  }

  async generateSessionInfo(user) {
    const sessions = await this.#readSessions();
    const { userId } = user;
    const sessionExists = Object.values(sessions).find(
      (session) => session.userId === userId
    );

    if (sessionExists) {
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

  async isTokenValid(token) {
    const sessions = await this.#readSessions();
    const doesSessionExist = token in sessions;

    if (!doesSessionExist) {
      return false;
    }

    const isTokenExpired = this.isExpired(token);

    if (isTokenExpired) {
      const { refreshToken } = await this.getSessionByToken(token);

      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      return await this.updateSession(token);
    }

    return true;
  }

  isExpired({ expirationTime }) {
    const currentTime = new Date().getTime();

    return expirationTime > currentTime;
  }

  async updateSession(token) {
    const sessions = await this.#readSessions();
    /*TODO:Порефакторить обновление сессии
     * https://github.com/users/BondarEgor/projects/1?pane=issue&itemId=81300820
     */
    if (!(token in sessions)) {
      throw new Error('No token found');
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
    const doesSessionExist = token in sessions;

    if (!doesSessionExist) {
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

  async #writeSessions(sessions) {
    try {
      await fs.writeFile(this.#filePath, JSON.stringify(sessions, null, 2));

      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}
