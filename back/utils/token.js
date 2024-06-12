const jwt = require('jsonwebtoken')

const payload = { username: 'user123' };
const secretKey = 'your-secret-key';


function generateToken() {
	return jwt.sign(payload,secretKey, {expiresIn:'1h'})
}


module.exports = generateToken