import { SERVICES } from "../../di/api";
import { diContainer } from "../../di/di";
import { createTemplate } from "./login-component.template";

export class LoginComponent extends HTMLElement {
  // #loginService = diContainer.resolve(SERVICES.login)

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get name() {
    return `login-component`;
  }

  connectedCallback() {
    this.#render([
      { placeholder: "Username", type: "text" },
      { placeholder: "Password", type: "password" },
    ]);
  }

  #render(fields) {
    const templateElement = document.createElement("template");
    templateElement.innerHTML = createTemplate(fields);

    this.shadowRoot.appendChild(templateElement.content.cloneNode(true));
  }
}
