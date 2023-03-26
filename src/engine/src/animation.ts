function engineApplyTransformOrFilter (
  element: SVGElement,
  targetProperty: 'transform' | 'filter',
  transformsOrFilters: readonly string[]
): void {
  element.style[targetProperty] = transformsOrFilters.join(' ')
}

function engineSetTransition (
  element: SVGElement,
  easingFunction: string,
  durationSeconds: number
): void {
  // Force style refresh.
  getComputedStyle(element).top

  element.style.transition = `all ${durationSeconds}s ${easingFunction}`
}
