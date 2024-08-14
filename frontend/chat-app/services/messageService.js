import {diContainer} from '../di/di.js';
import {SERVICES} from '../di/api.js';

export function messageService() {
    const httpService = diContainer.resolve(SERVICES.http)

    async function getMessagesByChatId(id) {
        return await httpService.get(`messages/${id}`)
    }

    return {
        getMessagesByChatId
    }
}