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
    } catch (error) {
      if (error === 'ENOENT')
        await fs.writeFile(this.#filePath, JSON.stringify([]));
    }
  }

  async createSession(sessionData) {
    const sessions = this.#readSessions();
    const { authToken } = sessionData;
    sessions[authToken] = sessionData;

    return await this.#writeSessions(sessions);
  }

  async #writeSessions(sessions) {
    await fs.writeFile(this.#filePath, JSON.stringify(sessions, null, 2));

    return true;
  }

  async updateSession(token) {
    //Здесь нужно будет добавить логику по обновлению токена, имея рефреш токен в следующих задачах
  }

  generateSession() {}
}
