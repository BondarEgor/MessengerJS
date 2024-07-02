import fs from 'fs/promises';
import path from 'path';
import PATHS from '../constants.js';
import { fileURLToPath } from 'url';

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

export class SessionDao {
  #filePath = path.join(_dirname, '../data', PATHS.sessions);

  async readSessionsFromFile() {
    try {
      const data = await fs.readFile(this.#filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error === 'ENOENT')
        await fs.writeFile(this.#filePath, JSON.stringify([]));
    }
  }

  async createSession(sessionInfo) {
    const sessions = (await this.readSessionsFromFile()) || {};
    const { userId } = sessionInfo;

    const isSessionExists = this.isSessionExists(sessions, userId);

    if (isSessionExists) {
      return await this.updateSession(userId);
    } else {
      sessions[userId] = sessionInfo;
      await this.saveSessionsToFile(sessions);
    }
  }

  async saveSessionsToFile(sessions) {
    await fs.writeFile(this.#filePath, JSON.stringify(sessions, null, 2));

    return true;
  }

  isSessionExists(sessions, userId) {
    return !!sessions[userId];
  }

  async getSessionById(userId) {}

  async updateSession(sessionId) {
    const sessions = await this.readSessionsFromFile();
    const newExpireTime = new Date().getTime();
    sessions[sessionId].expireTime = newExpireTime;
    const saveNewSession = await this.saveSessionsToFile(sessions);

    return !!saveNewSession;
  }

  async deleteSession() {}

  generateSession() {}
}
