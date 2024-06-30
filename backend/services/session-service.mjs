import bcrypt from 'bcrypt';

export function sessionService() {
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
}
