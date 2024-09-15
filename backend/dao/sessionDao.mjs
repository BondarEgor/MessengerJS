import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { PATHS } from '../constants.js';
import jwt from 'jsonwebtoken'

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

  async isUserIdValid(userId) {
    const sessions = await this.#readSessions();

    return Object.values(sessions).some((session) => session.userId === userId);
  }

  async isTokenValid(token) {
    try {
      const valid = jwt.verify(token, process.env.JWT_SECRET);

      return valid
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        const { userId } = jwt.decode(token)
        const { refreshToken } = await this.getSessionByUserId(userId)

        //TODO: тут нужно добавить логику валидации самого рефреша
        if (!refreshToken) {
          throw new Error('Refresh token not found, please log in')
        }

        return await this.updateSession(token)
      }
    }
  }

  async createSession(sessionData) {
    const sessions = await this.#readSessions();
    const { userId } = sessionData;
    sessions[userId] = sessionData;

    return await this.#writeSessions(sessions);
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
    const { userId, username } = jwt.decode(token)

    if (!(userId in sessions)) {
      throw new Error('User not registered')
    }

    const newToken = jwt.sign({
      userId,
      username,
    }, process.env.JWT_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXP })

    const refreshToken = jwt.sign({ token }, process.env.JWT_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXP })

    sessions[userId] = {
      ...sessions[userId],
      token: newToken,
      refreshToken
    }

    await this.#writeSessions(sessions);

    return {
      token: newToken,
      refreshToken
    }
  }

  async getSessionByUserId(userId) {
    const sessions = await this.#readSessions();
    const isSessionExist = userId in sessions;

    if (!isSessionExist) {
      return false
    }

    return sessions[userId]
  }

  async deleteSessionById(userId) {
    const sessions = await this.#readSessions();
    const deletedSession = delete sessions[userId];
    await this.#writeSessions(sessions);

    return deletedSession;
  }
}
