import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { ONE_DAY, ONE_HOUR, PATHS } from '../constants.js';
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
    //FIXME: Нужно ли нам задуматься о нескольких сессиях для одного юзера, например с разных устройств
    sessions[token] = sessionData;
    const isWritten = await this.#writeSessions(sessions);

    if (!isWritten) {
      throw new Error('Failed to write sesions');
    }

    return sessions[token];
  }

  async generateSessionInfo(user) {
    const sessions = await this.#readSessions();
    const { userId } = user;

    const userHasSession = Object.values(sessions).find(
      (session) => session.userId === userId
    );

    if (userHasSession) {
      const { token } = userHasSession;

      return sessions[token];
    }

    const authToken = await this.#generateToken(user);
    const refreshToken = await this.#generateToken(user);

    return await this.createSession({
      userId,
      token: authToken,
      refreshToken,
      tokenExpireTime: new Date().getTime() + ONE_HOUR,
      refreshExpireTime: new Date().getTime() + ONE_DAY,
    });
  }

  async #generateToken(userData) {
    const combinedValues = Object.values(userData).join('-');
    const saltRounds = 10;

    return await bcrypt.hash(combinedValues, saltRounds);
  }

  async isTokenValid(token) {
    const sessions = await this.#readSessions();
    const userHasSession = token in sessions;

    if (!userHasSession) {
      throw new Error('Token not valid');
    }

    const { refreshToken, tokenExpireTime, refreshExpireTime } =
      await this.getSessionByToken(token);

    const isTokenExpired = this.#isExpired(tokenExpireTime);

    if (isTokenExpired) {
      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      const isRefreshExpired = this.#isExpired(refreshExpireTime);

      if (isRefreshExpired) {
        delete sessions[token];
        await this.#writeSessions(sessions);

        throw new Error('Refresh token expired, try to log in');
      }

      const newSession = await this.#updateSession(token);

      return { valid: true, updated: true, session: newSession };
    }

    return { valid: true, updated: false, session: sessions[token] };
  }

  #isExpired(expireTime) {
    if (!expireTime) {
      throw new Error('No expire time');
    }

    const currentTime = new Date().getTime();

    return currentTime > expireTime;
  }

  async #updateSession(token) {
    const sessions = await this.#readSessions();
    const sessionInfo = sessions[token];
    const newToken = await this.#generateToken(sessionInfo);
    const refreshToken = await this.#generateToken(sessionInfo);

    const updatedSessinInfo = {
      ...sessionInfo,
      token: newToken,
      refreshToken,
      tokenExpireTime: new Date().getTime() + ONE_DAY,
      refreshExpireTime: new Date().getTime() + ONE_HOUR,
    };

    delete sessions[token];

    sessions[newToken] = updatedSessinInfo;
    const isWritten = await this.#writeSessions(sessions);

    if (!isWritten) {
      throw new Error('Failed to write session, try again');
    }

    return { token: newToken, refreshToken };
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
    const isWritten = await this.#writeSessions(sessions);

    if (!isWritten) {
      throw new Error('Failed to write sesions');
    }

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
