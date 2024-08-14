import './style.css';
import {diContainer} from './chat-app/di/di.js';
import {SERVICES} from './chat-app/di/api.js';
import {messageService} from './chat-app/services/messageService.js';
import {httpService} from './chat-app/services/httpService.js';
import {ChatComponent} from './chat-app/components/chat/chat-component.js';


diContainer.register(SERVICES.messages, messageService);
diContainer.register(SERVICES.http, httpService);

[
    ChatComponent,
].map(component => customElements.define(component.name, component));

