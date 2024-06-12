const express = require('express')
const app = express()
const port = 3000
const cors = require('cors')
const bodyParser = require('body-parser')
const generateToken = require('./utils/token')
const cookieParser = require('cookie-parser')
const isTokenSent = require('./middlewares/checkTokenCookie')

app.use((req, res, next) => {
	const excludedPaths = ['/api/auth/login', '/api/auth/register']
	if (excludedPaths.includes(req.path)) {
		next()
	} else {
		isTokenSent(req, res, next)
	}
})
app.use(bodyParser.json())
app.use(cookieParser())
app.use(
	cors({
		credentials: true,
	})
)
app.get('/home', (req, res) => {})

app.post('/api/auth/login', (req, res) => {
	const { username, password } = req.body
	if (username === 'user123' && password === 'password') {
		const payload = { username }
		const token = generateToken(payload)
		res.cookie('token', token, { httpOnly: true, secure: true })
		res.json({ message: 'Logged in successfully' })
	} else {
		res.status(401).json({ message: 'Invalid name or password' })
	}
})

app.post('/api/auth/register', (req, res) => {})

app.get('/api/users', (req, res) => {})

app.put('/api/users', (req, res) => {})

app.delete('/api/users', (req, res) => {})

app.post('/api/users', (req, res) => {})

app.post('/api/chats', (req, res) => {})

app.get('/api/chats/messages', (req, res) => {})

app.post('/api/chats/messages', (req, res) => {})

app.put('/api/chats/messages', (req, res) => {})

app.delete('/api/chats/messages', (req, res) => {})

app.get('/api/search', (req, res) => {
	const { q, type } = req.query
	if (type === 'users') {
	} else if (type === 'messages') {
	}
})

app.get('/api/notifications', (req, res) => {})

app.post('/api/notifications/settings', (req, res) => {})

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})
