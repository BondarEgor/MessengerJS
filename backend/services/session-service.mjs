import bcrypt from 'bcrypt';
import fs from 'fs/promises';
import path from 'path';
import PATHS from '../constants.js';
import { fileURLToPath } from 'url';

export function sessionService() {
  const _filename = fileURLToPath(import.meta.url);
  const _dirname = path.dirname(_filename);
  const filePath = path.join(_dirname, '../data', PATHS.sessions);

  async function generateSessionInfo(username, password) {
    const currentDate = new Date().getTime();
    const salt = await bcrypt.genSalt(10);
    const sessionId = await bcrypt.hash(
      `${username}${password}${currentDate}`,
      salt
    );

    const authToken =
      'Bearer ' + (await bcrypt.hash(`${currentDate}${sessionId}`, salt));

    return {
      sessionId,
      authToken,
    };
  }

  return {
    generateSessionInfo,
  };

  async function readSessionsFromFile() {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error === 'ENOENT') await fs.writeFile(filePath, JSON.stringify([]));
    }
  }
  async function saveSessionsToFile(sessions) {
    await fs.writeFile(filePath, JSON.stringify(sessions, null, 2));
  }
}
