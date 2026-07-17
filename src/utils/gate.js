let listeners = [];

let currentState = "closed";

export function setGateState(state) {
    currentState = state;

    listeners.forEach(listener => listener(state));
}

export function getGateState() {
    return currentState;
}

export function onGateState(callback) {
    listeners.push(callback);

    callback(currentState);

    return () => {
        listeners = listeners.filter(l => l !== callback);
    };
}