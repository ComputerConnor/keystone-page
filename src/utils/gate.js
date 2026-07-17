let listeners = [];

export function openGate(){
    listeners.forEach(
        callback => callback()
    );
}

export function onGateOpen(callback){
    listeners.push(callback);
    return () => {
        listeners = listeners.filter( item => item !== callback)
    };
}