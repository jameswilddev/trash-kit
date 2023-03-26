export default async function (
  previous: string,
  iterate: (previous: string) => Promise<string>
): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const next = await iterate(previous)

    if (next === previous) {
      return next
    }

    previous = next
  }

  console.warn('Minification did not stabilize after 10 attempts.')
  return previous
}
