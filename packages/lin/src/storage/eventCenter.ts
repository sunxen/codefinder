const listeners = new Map<string, Set<() => void>>()

function getListeners(key: string) {
    if (!listeners.has(key)) {
        listeners.set(key, new Set())
    }
    return listeners.get(key)
}

export function onProjectUpdate(key: string, listener: () => void): void {
    const some = getListeners(key)
    if (some.has(listener)) {
        return
    }
    some.add(listener)
}

export function notifyProjectUpdate(key: string): void {
    const some = getListeners(key)
    some.forEach(listener => listener())
    listeners.delete(key)
}
