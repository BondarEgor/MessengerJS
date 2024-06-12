1. Аутентификация и авторизация
	- POST /api/auth/login - для логина пользователя
	- POST /api/auth/register - для регистрации нового пользователя
2. Управление пользователями
	- GET /api/users/
	- PUT /api/users/
	- DELETE /api/users/
	- POST /api/users
3. Чат
	- POST /api/chats - создание нового чата
	- GET /api/chats/messages - получение сообщений из чата по его ID
	- POST /api/chats/messages - отправка сообщения в чат
	- PUT /api/chats/messages/ - обновление сообщения
	- DELETE /api/chats/messages/ - удаление сообщения
4. Поиск
	- GET /api/search/users?q=query - поиск пользователей по запросу
	- GET /api/search/messages?q=query - поиск сообщений по запросу
	Здесь можно сделать один метод который просто будет искать по совпадению
5. Уведомления
	- GET /api/notifications - получение уведомлений пользователя
	- POST /api/notifications/settings - обновление настроек уведомлений

