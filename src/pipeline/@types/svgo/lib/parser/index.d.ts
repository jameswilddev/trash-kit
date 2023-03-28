declare module 'svgo/lib/parser' {
  interface SvgoNode {
    attributes: { id?: string }
    children: SvgoNode[]
  }

  export function parseSvg (svg: string): SvgoNode
}
