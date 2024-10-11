import { diContainer } from '../di/di.mjs';
import { SERVICES } from '../di/api.mjs';

export async function authMiddleware(req, res, next) {
  const sessionService = diContainer.resolve(SERVICES.sessions);
  const authToken = req.headers['authorization'];

  if (!authToken) {
    return res.status(401).json({ message: 'Provide authorization header' });
  }

  try {
    const { valid, updated, message, session } =
      await sessionService.isTokenValid(authToken);
    console.log(valid);
    if (!valid) {
      return res.status(401).json({ message });
    }

    if (updated && session) {
      res.setHeader('authorization', session.token);
      req.authToken = session.token;
    }

    next();
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
