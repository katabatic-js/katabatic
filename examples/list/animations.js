export function fade(element, { duration = 1000, direction = 'in' } = {}) {
    return element.animate(
        [{ opacity: direction === 'out' ? 1 : 0 }, { opacity: direction === 'out' ? 0 : 1 }],
        { duration, easing: 'ease-in-out', fill: 'forwards' }
    )
}
