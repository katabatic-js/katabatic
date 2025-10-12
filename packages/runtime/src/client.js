export class Client extends Set {
    dispose() {
        for (const entry of cleared(this)) {
            entry.dispose?.()
        }
    }
}

const cleared = (self) => {
    const entries = [...self]
    self.clear()
    return entries
}
