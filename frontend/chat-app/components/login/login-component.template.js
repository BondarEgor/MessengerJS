import { getLoginComponentStyles } from "./login-component.styles";

export function createTemplate(fields = []) {
    return `
    ${getLoginComponentStyles()}

        <div class="login"> 
            <h1>Login</ h1>
        </ div>

        <div class="login-form">
          ${fields
            .map(
                ({ placeholder, type }) =>
                    `<input placeholder="${placeholder}" type="${type}"/>`,
            )
            .join("")}
             <button>Log in</ button>
        </div>
    `;
}
