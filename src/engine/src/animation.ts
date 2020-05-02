function engineSetTransition(
  element: SVGElement,
  easingFunction: string,
  durationSeconds: number,
): void {
  // Force style refresh.
  getComputedStyle(element).top

  element.style.transition = `all ${durationSeconds}s ${easingFunction}`
}
