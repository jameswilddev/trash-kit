declare module 'svgo/lib/parser' {
  interface SvgoNode {
    readonly attributes: Record<string, string>
    readonly children: SvgoNode[]
  }

  export function parseSvg (svg: string): SvgoNode
}
