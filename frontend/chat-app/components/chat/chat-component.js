import { addListeners, removeListeners, select } from "../../utils/utils.js";
import { diContainer } from "../../di/di.js";
import { SERVICES } from "../../di/api.js";
import { createTemplate } from "./chat-component.template.js";

const ChatAttributes = {
  TEST_ATTRIBUTE: "test-text",
};
export class ChatComponent extends HTMLElement {
  #messageService = diContainer.resolve(SERVICES.messages);
  static get name() {
    return "chat-component";
  }

  #listeners = [
    [select.bind(this, ".chat"), "click", this.#addEventListeners.bind(this)],
  ];

  #ATTRIBUTE_MAPPING = new Map([
    [ChatAttributes.TEST_ATTRIBUTE, this.#setText],
  ]);

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return Object.values(ChatAttributes);
  }

  connectedCallback() {
    this.#messageService
      .getMessagesByChatId(3)
      .then((data) => this.#render(data));

    this.#listeners.forEach(addListeners.bind(this));

    for (let attrName of this.constructor.observedAttributes) {
      if (this.hasAttribute(attrName)) {
        const attrValue = this.getAttribute(attrName);
        this.attributeChangedCallback(attrName, null, attrValue);
      }
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (newValue !== oldValue) {
      const callback = this.#ATTRIBUTE_MAPPING.get(name);
      callback(newValue);
    }
  }

  #setText(newText) {
    console.log(newText);
  }

  #addEventListeners(event) {
    console.log("Emitted event: ", event);
  }

  disconnectedCallback() {
    this.#listeners.forEach(removeListeners);
  }

  #render(messages) {
    const templateElem = document.createElement("template");
    templateElem.innerHTML = createTemplate(messages);

    this.shadowRoot.appendChild(templateElem.content.cloneNode(true));
  }
}
