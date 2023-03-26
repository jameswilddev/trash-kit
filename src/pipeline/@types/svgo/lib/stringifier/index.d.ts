declare module 'svgo/lib/stringifier' {
  interface SvgoNode {
    readonly attributes: Record<string, string>
    readonly children: SvgoNode[]
  }

  export function parseSvg (node: SvgoNode): string
}
