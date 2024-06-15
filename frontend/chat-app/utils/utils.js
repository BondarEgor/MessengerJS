export function select(className, context) {
    const root = context ?? this.shadowRoot;
    const node = className ? root.querySelector(className) : null;
    return node ?? root;
}

export function addListeners([node, event, listener]) {
    node()?.addEventListener(event, listener);
}

export function removeListeners([node, event, listener]) {
    node()?.removeEventListener(event, listener);
}