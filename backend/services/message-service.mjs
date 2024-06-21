export function messageService() {
	function generateMockMessages(chatId, numMessages = 5) {
		const messages = []
		for (let i = 0; i < numMessages; i++) {
			messages.push({
				id: `${chatId}-${i}`,
				author: `Author ${Math.floor(Math.random() * 10)}`,
				message: `Message ${Math.random().toString(36).substring(7)}`,
			})
		}
		return messages
	}

	return {
		getMessages: generateMockMessages,
	}
}
