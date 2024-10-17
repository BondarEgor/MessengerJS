import { SERVICES } from "../../di/api";
import { diContainer } from "../../di/di";
import { addListeners, removeListeners, select } from "../../utils/utils";
import { createTemplate } from "./login-component.template";

export class LoginComponent extends HTMLElement {
  #authService = diContainer.resolve(SERVICES.auth);
  static get name() {
    return "login-component";
  }

  #listeners = [
    [select.bind(this, ".login-form"), "submit", this.#handleSubmit.bind(this)],
  ];
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.#listeners.forEach(addListeners.bind(this));
    this.#render();
  }

  #handleSubmit(event) {
    event.preventDefault();

    const username = this.shadowRoot.querySelector(".email");
    const password = this.shadowRoot.querySelector(".password");
    console.log(username, ": USERNAME");
    console.log(password, ": PASS");
  }

  #render() {
    const templateElem = document.createElement("template");
    templateElem.innerHTML = createTemplate();

    this.shadowRoot.appendChild(templateElem.content.cloneNode(true));
  }

  disconnectedCallback() {
    this.#listeners.forEach(removeListeners);
  }
}
