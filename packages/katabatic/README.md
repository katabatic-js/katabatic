

# Katabatic

A simple and efficient way to develop Web Components !

Katabatic is a compiler that transforms HTML modules into JavaScript.
Its goal is to provide a modern, framework-free web development experience by relying solely on standard APIs.

- :sparkles: No API ! Write plain HTML, CSS and JS without having to learn yet an other framework.
- :heart: Web Components without the complexity
- :zap: Reactive with signals

```html
<script type="module">
    export class Counter extends HTMLElement {
        count = 0
    }

    customElements.define('my-counter', Counter);
</script>

<template>
    <div>
        <button onclick="{count++}">counter is {count}</button>
    </div>
    <style>
        button {
            padding: 0.5rem;
            text-transform: uppercase;
        }
    </style>
</template>
```

## Getting started

```
npm i katabatic -D
npm i @katabatic/runtime

npx katabatic

```

See the [examples](examples)