import { signal } from '@drop/signals'

export const items = signal([{ name: 'Item 1' }, { name: 'Item 2' }])

export function add() {
    items.push({ name: `Item ${this.items.length + 1}` })
}

export function up(item) {
    const index = this.items.indexOf(item)
    if (index > 0) {
        this.items.splice(index, 1)
        this.items.splice(index - 1, 0, item)
    }
}

export function down(item) {
    const index = this.items.indexOf(item)
    if (index >= 0 && index < this.items.length - 1) {
        this.items.splice(index, 1)
        this.items.splice(index + 1, 0, item)
    }
}

export function remove(item) {
    this.items.splice(this.items.indexOf(item), 1)
}
