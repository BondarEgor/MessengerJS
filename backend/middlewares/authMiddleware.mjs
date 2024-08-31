import { diContainer } from '../di/di.mjs';
import { SERVICES } from '../di/api.mjs';

export async function authMiddleware(req, res, next) {
  const sessionService = diContainer.resolve(SERVICES.sessions);
  const authToken = req.headers['authorization'];

  if (!authToken) {
    return res.status(401).json({ message: 'Token is not valid' });
  }

  try {
    const isValid = await sessionService.isTokenValid(authToken);

    if (!isValid) {
      res.status(401).json({ message: 'Token not valid' });
    }

    next();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
