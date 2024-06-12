//Взял данную реализацию с прошлого своего проекта, где мне надо было в каждый запрос докидывать хедер с авторизацией, пока просто как референс
module.exports = (req, res, next) => {
  if (req.method === 'GET' && req.path === '/token') {
    next();
  } else {
    const authHeader = req.headers['token'];
    if (authHeader) {
      const token = authHeader;
      if (token === '123') {
        next(); 
      } else {
        res.status(401).json({ error: 'Invalid token' }); 
      }
    } else {
      res.status(401).json({ error: 'No token provided' });
    }
  }
};
