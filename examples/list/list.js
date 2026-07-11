import { signal } from '@katabatic/signals'

export const items = signal([{ name: 'Item 1' }, { name: 'Item 2' }])

export function add() {
    items.push({ name: `Item ${items.length + 1}` })
}

export function up(item) {
    const index = items.indexOf(item)

    if (index > 0) {
        items.splice(index, 1)
        items.splice(index - 1, 0, item)
    }
}

export function down(item) {
    const index = items.indexOf(item)
    if (index >= 0 && index < items.length - 1) {
        items.splice(index, 1)
        items.splice(index + 1, 0, item)
    }
}

export function remove(item) {
    items.splice(items.indexOf(item), 1)
}
