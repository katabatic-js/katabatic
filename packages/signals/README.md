# @katabatic/signals

A lightweight, proxy-based reactive signal library for JavaScript.

- **Proxy-Based Reactivity** - Transparent tracking via JavaScript Proxies
- **Event-Driven** - Built on EventTarget API
- **Microtask Scheduling** - Optimized effect batching

## Installation

```bash
npm install @katabatic/signals
```

## Quick Start

```javascript
import { signal, effect } from '@katabatic/signals'

// Create signal
const count = signal({ value: 0 })

// Create effect
effect(() => {
  console.log(`Count: ${count.value}`)
})

count.value = 5 // Triggers effect
```

## API

### `signal(object)`

Creates a reactive signal from an object or array.

```javascript
const obj = signal({ x: 1, y: 2 })
const arr = signal([1, 2, 3])
```

Objects and Arrays are wrapped in a proxy while all other data types are left untouched.

### `effect(fn)`

Creates an effect that re-runs when tracked signal properties change.

```javascript
const count = signal({ value: 0 })

effect(() => {
  console.log(count.value) // Automatically tracked
})
```

The effect function can return an optional cleanup function. Effects run asynchronously by default.

### `compute(fn)`

Creates a derived signal that re-computes when dependencies change.

```javascript
const count = signal({ value: 0 })
const doubled = compute(() => count.value * 2)

effect(() => {
    console.log(doubled()) // Returns current value
})
```

The effect is triggered only if the computed value changes.

### `boundary(fn)`

Creates an isolation boundary preventing effect tracking propagation.

```javascript
effect(() => {
    boundary(() => {
        // signals here are not tracked by the outer effect
    })
})
```

### `untracked(fn)`

Executes code without dependency tracking.

```javascript
const count = signal({ value: 0 })

effect(() => {
  console.log(untracked(() => count.value)) // Not Tracked
})
```

## Nested Objects & Arrays

Signals handle nested structures automatically:

```javascript
const state = signal({
  user: { name: 'Alice', tags: ['admin'] }
})

effect(() => {
  console.log(state.user.name)      // Tracked
  console.log(state.user.tags[0])   // Tracked
})

state.user.name = 'Bob'              // Re-runs effect
state.user.tags.push('moderator')   // Re-runs effect
```

## Class based signals

A Signal can also be created by extending the `Signal` class. 

```javascript
import { Signal } from '@katabatic/signals'

class Count extends Signal {
    static observedProperties = ['value']

    #unit

    constructor() {
        super()
        this.value = 0
    }

    get unit() {
        this.trackEvent('unitChanged')
        return this.#unit
    }

    set unit(unit) {
        this.#unit = unit
        this.dispatchEvent(new SignalEvent('unitChanged'))
    }
}
```

Dependency tracking can either be declarative with the static `observerProperties` property or explicit using the `dispatchEvent` and `trackEvent` methods.

## License

MIT

---

Part of the [Katabatic](https://github.com/katabatic-js/katabatic) project.