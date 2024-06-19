export function registrationService() {
	function registerUser(username, password) {
		//Здесь мы должны просто на фронт вернуть инфо об успехе операции, что новый юзер был создан
		return true
	}
	return { getRegisteredUser: registerUser }
}
