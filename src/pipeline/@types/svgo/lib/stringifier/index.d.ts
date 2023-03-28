declare module 'svgo/lib/stringifier' {
  interface SvgoNode {
    attributes: { id?: string }
    children: SvgoNode[]
  }

  export function stringifySvg (node: SvgoNode): string
}
