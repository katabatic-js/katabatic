
/**
 * Dead simple clx assuming class2 is always set
 * @param {string} class1
 * @param {string} class2
 * @returns {string}
 */
export function clx(class1, class2) {
    if (class1) return class1 + ' ' + class2
    return class2
}
