import { getChatComponentStyles } from "./chat-component.styles.js";

export function createTemplate(messages = []) {
  return `
    ${getChatComponentStyles()}
    
    <div class="chat-text"></div>
    
    <div class="chat">
        hello from chat
    
        <ul> 
         ${messages
           .map(
             ({ id, author, message }) => `<li>
                                                                <span>ID: ${id}</span> 
                                                                <span>Author: ${author}</span> 
                                                                <span>Message: ${message}</span> 
                                                           </li>`,
           )
           .join("")}
        </ul>
         
    </div>
    `;
}
