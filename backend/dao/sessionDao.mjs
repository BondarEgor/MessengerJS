import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { PATHS } from '../constants.js';

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

export class SessionDao {
  #filePath = path.join(_dirname, '../data', PATHS.sessions);

  async #readSessions() {
    try {
      const data = await fs.readFile(this.#filePath, 'utf-8');

      return JSON.parse(data);
    } catch (e) {
      console.error(e);
      await fs.writeFile(this.#filePath, JSON.stringify({}));
    }
  }

  async isUserIdValid(userId) {
    const sessions = await this.#readSessions();

    return Object.values(sessions).some((session) => session.userId === userId);
  }

  async isTokenValid(token) {
    const sessions = await this.#readSessions();
    const isSessionValid = Object.values(sessions).some((session) => {
      return session.authToken === token && session.expireDate > Date.now();
    });

    if (!isSessionValid) {
      throw new Error('Session not valid');
    }

    return isSessionValid;
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
      console.error(e)
      return false;
    }
  }

  async updateSession(userId, updatedSessionInfo) {
    const sessions = await this.#readSessions();

    sessions[userId] = updatedSessionInfo;

    await this.#writeSessions(sessions);
  }

  async getSessionByUserId(userId) {
    const sessions = await this.#readSessions();

    return sessions[userId];
  }

  async deleteSessionById(userId) {
    const sessions = await this.#readSessions();
    const deletedSession = delete sessions[userId];
    await this.#writeSessions(sessions);

    return deletedSession;
  }
}
