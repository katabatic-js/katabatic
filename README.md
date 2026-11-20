# Katabatic

**A framework-free approach to modern web application development.**

Katabatic is a compiler that transforms HTML modules into JavaScript, providing a simple and efficient way to develop Single Page Applications (SPAs).

Inspired by Svelte's declarative syntax and reactive programming model, Katabatic builds on native browser technologies, including Web Components and standard JavaScript APIs, rather than introducing its own framework or component model.

It provides the tools to build complete reactive web applications while keeping the development model close to the web platform itself.

```html
<script type="module">
    export class Counter extends HTMLElement {
        count = 0
    }

    customElements.define('my-counter', Counter)
</script>

<template>
    <div>
        <button onclick="{count++}">
            Counter is {count}
        </button>
    </div>

    <style>
        button {
            padding: 0.5rem;
        }
    </style>
</template>
```

## Features

- **Framework-free** — Build modern web applications without a framework runtime or framework-specific programming model.
- **Native Web Components** — Use standard Custom Elements as the building blocks of your application.
- **Declarative templates** — Write expressive HTML templates enhanced with familiar JavaScript expressions and control-flow blocks.
- **Fine-grained reactivity** — Build reactive interfaces with an efficient signals-based system.
- **Element bindings** — Extend DOM elements with custom behavior and interact with them through bindings.
- **Animations** — Add enter, leave, and custom animations using the native Web Animations API.
- **Scoped CSS** — Keep component styles local without having to write special selectors or manage scope identifiers.
- **Vite integration** — Enjoy a smooth development workflow with Vite, including Hot Module Replacement.

## Getting started

### Installation

Katabatic is designed to work with Vite through its dedicated plugin.

Install the required packages:

```bash
npm install -D vite vite-plugin-katabatic
npm install @katabatic/runtime
```

### Vite configuration

Add the Katabatic plugin to your Vite configuration:

```js
// vite.config.js
import { defineConfig } from 'vite'
import { katabatic } from 'vite-plugin-katabatic'

export default defineConfig({
    plugins: [katabatic()]
})
```

### First component

Create a component in an Katabatic module:

```html
<!-- src/my-counter.ktb -->

<script type="module">
    export class Counter extends HTMLElement {
        count = 0
    }

    customElements.define('my-counter', Counter)
</script>

<template>
    <button onclick="{count++}">
        Count: {count}
    </button>
</template>
```

Import the component from your application's JavaScript entry point:

```js
// src/main.js
import './my-counter.ktb'
```

Use the component as an ordinary HTML element:

```html
<!-- index.html -->

<!DOCTYPE html>
<html>
    <head>
        <title>My Katabatic application</title>
    </head>
    <body>
        <my-counter></my-counter>

        <script type="module" src="/src/main.js"></script>
    </body>
</html>
```

## Components

Katabatic components are native Custom Elements. They extend `HTMLElement` and use the standard lifecycle callbacks.
There is no base class or framework-specific component API.

```js
export class Counter extends HTMLElement {
    count = 0
}
```

### Registering a component

Custom Elements are registered using the standard `customElements.define()` method:

```js
customElements.define('my-counter', Counter)
```

Registration is optional.
When a component is not explicitly registered, Katabatic generates a unique element name. This avoids naming conflicts between components.
An implicitly named component is intended to be used within other Katabatic components rather than directly from application HTML.
Explicit registration, on the other hand, makes the component available under its chosen tag name throughout the application.

### Importing a component

A component can be imported into another component using a standard JavaScript import statement. In this case, the component's file name (without its extension) must match the custom element's tag name used in the importing component's template.

For example, importing `./my-button.ktb` makes the `<my-button>` element available in the template:


```html
<script type="module">
    import './my-button.ktb'

    export class Panel extends HTMLElement {}
    
    customElements.define('my-panel', Panel)
</script>

<template>
    <my-button></my-button>
</template>
```

### Reactivity

Katabatic provides a [signals library](https://github.com/katabatic-js/katabatic/tree/master/packages/signals) for fine-grained reactivity.
During compilation, public instance properties of Custom Elements are automatically made reactive using this signals mechanism.
This means Custom Elements properties can be used directly in templates, without explicitly creating signals.

```js
export class Counter extends HTMLElement {
    count = 0

    increment() {
        this.count++
    }
}
```

When `count` changes, the expressions in the template that depend on it are automatically updated.

### Lifecycle callbacks

Katabatic works with the native Custom Element lifecycle.
Katabatic integrates its rendering and reactivity with these callbacks while allowing developers to provide their own implementations.

The component can implement the usual callbacks, including:

- `constructor()`
- `connectedCallback()`
- `disconnectedCallback()`
- `attributeChangedCallback()`



### DOM and Shadow DOM

By default, Katabatic appends the template content to the component's regular DOM children. It does not automatically create a Shadow Root.
Shadow DOM can be enabled explicitly using the template `shadowRootMode` property. When enabled, the template content is appended to the component's Shadow Root instead.

```html
<template shadowRootMode="open">
    <button>Click me</button>
</template>
```

## Template syntax

Katabatic extends HTML templates with JavaScript expressions, control-flow blocks, element bindings and animations.

### Reactivity

Katabatic uses its [signals library](https://github.com/katabatic-js/katabatic/tree/master/packages/signals) to provide fine-grained reactivity.
Expressions in templates are reactive by default. Katabatic tracks the values accessed by each expression and automatically updates the corresponding DOM when those values change.
This applies throughout the template, wherever an expression is used, including text content, HTML attributes and control-flow expressions.

Signals can also be defined outside the component, in separate JavaScript modules, and imported into a component. Expressions in the template that access these signals are tracked just like expressions that access component properties.

### `{expression}` — Expressions

JavaScript expressions can be embedded directly in text:

```html
<p>Count: {count}</p>
<p>Double: {count * 2}</p>
<p>{getMessage()}</p>
```

Expressions can also be used in HTML attributes:

```html
<input value="{count}">
<button class="{getClass()}">Click me</button>
```

Event listeners can be registered using `on<...>` attributes.
These attributes attach event listeners directly to the DOM element.

```html
<button onclick="{increment()}">
    Increment
</button>
```

### `{#if condition}` — Conditional rendering

Use `{#if}` to conditionally render content.

```html
{#if count > 0}
    <p>Positive</p>
{/if}
```

Alternative branches are supported with `{:else if}` and `{:else}`:

```html
{#if count > 0}
    <p>Positive</p>
{:else if count < 0}
    <p>Negative</p>
{:else}
    <p>Zero</p>
{/if}
```

Conditional blocks can be nested.

### `{#each items as item}` — Iteration

Use `{#each}` to render a collection:

```html
<ul>
    {#each items as item}
        <li>{item.name}</li>
    {/each}
</ul>
```

An optional key expression can identify individual items. Keyed iteration allows Katabatic to track items by their identity when the collection changes.

```html
{#each items as item (item.id)}
    <li>{item.name}</li>
{/each}
```

### `:use`, `:<property>` and `:on<...>` — Element bindings

Bindings provide a way to associate reusable behavior with DOM elements.
The `:use` attribute creates a binding by calling a function with the element and optional options:

```html
<div :use="{myBinding({ someOption: true })}">
    ...
</div>
```

A binding function can return an object. The returned object becomes the element's binding.

```js
function myBinding(element, options) {
    // Initialize the binding

    return {
        someProperty: undefined,

        dispose() {
            // Cleanup
        }
    }
}
```

Katabatic manages its lifecycle and calls `dispose()` when the binding is no longer needed.
Bindings provide an extensible mechanism for adding behavior to elements without introducing a new element or component abstraction.

**Binding properties**

A colon-prefixed property assigns a reactive value to a property of the element's binding:

```html
<div
    :use="{myBinding()}"
    :value="{someValue}"
>
    ...
</div>
```

Here, `value` is assigned to the binding object, not directly to the DOM element.

**Binding event listeners**

A colon-prefixed event attribute registers an event listener on the element's binding.
For this to work, the binding object returned by the binding function must extend EventTarget.

```html
<div
    :use="{myBinding()}"
    :onchange="{handleChange}"
>
    ...
</div>
```

This differs from an ordinary event attribute:

```html
<button onclick="{handleClick}">
    Click me
</button>
```

`onclick` attaches an event listener directly to the DOM element, whereas `:onclick` attaches it to the element's binding.


### `:animate`, `:in` and `:out` — Animations

Katabatic supports three attributes for associating animations with elements:

- `:in` associates an animation with an element when it enters the DOM.
- `:out` associates an animation with an element when it leaves the DOM.
- `:animate` associates an animation with both directions.

For example:

```html
<p :in="{fade({ duration: 500 })}">
    Hello!
</p>

<p :out="{fade({ duration: 500 })}">
    Goodbye!
</p>

<p :animate="{fade({ duration: 500 })}">
    Hello again!
</p>
```

Animation functions receive the DOM element and an options object containing a `direction` property, which is either `"in"` or `"out"`.
They return an `Animation` object, using the native Web Animations API.
For example:

```js
function fade(element, { duration = 500, direction = 'in' } = {}) {
    return element.animate(
        [
            { opacity: direction === 'in' ? 0 : 1 },
            { opacity: direction === 'in' ? 1 : 0 }
        ],
        {
            duration,
            fill: 'forwards'
        }
    )
}
```

## Styling

Katabatic supports ordinary CSS inside component templates.

### Scoped styles

CSS selectors are automatically scoped to their component.
The goal is to ensure that selectors defined in a component's stylesheet only apply to elements belonging to that component.
This prevents component styles from unintentionally affecting other parts of the application.

```html
<template>
    <button>Click me</button>

    <style>
        button {
            padding: 0.5rem;
        }

        button.active {
            color: red;
        }
    </style>
</template>
```

It is important to distinguish CSS scoping from Shadow DOM encapsulation: scoping localizes component selectors, but does not create a separate DOM or a complete style-isolation boundary.

### `:host` selector

The `:host` selector can be used to target the component itself.
Katabatic handles `:host` according to whether Shadow DOM is enabled, preserving its native meaning when used inside a Shadow Root.

```css
:host {
    display: block;
    color: blue;
}
```

## Advanced usage

### Katabatic CLI

Katabatic also provides a CLI for compiling HTML modules without using Vite.

Vite is the recommended approach for application development. The CLI is primarily useful when developing libraries or when a standalone compilation and development workflow is preferred.

Install it:

```bash
npm install -D katabatic
npm install @katabatic/runtime
```

Compile the project:

```bash
npx katabatic
```

Watch source files and start the development server:

```bash
npx katabatic --watch --serve
```

## Project status

Katabatic is under active development. Its API is relatively stable at this point, though some changes may still occur as the project evolves.

Contributions are very welcome! Whether you'd like to improve the documentation, fix a bug, suggest an enhancement or contribute code.

**License:** MIT