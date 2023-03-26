import * as Svgo from 'svgo'
import ActionStepBase from './action-step-base'
import iterativelyMinify from '../../utilities/iteratively-minify'

const floatPrecision = 0

const options: Svgo.Config = {
  multipass: false,
  floatPrecision,
  plugins: [
    'cleanupAttrs',
    'cleanupEnableBackground',
    'cleanupIds',
    {
      name: 'cleanupListOfValues', params: { floatPrecision }
    },
    { name: 'cleanupNumericValues', params: { floatPrecision } },
    'collapseGroups',
    'convertColors',
    'convertEllipseToCircle',
    { name: 'convertPathData', params: { floatPrecision } },
    'convertShapeToPath',
    'convertStyleToAttrs',
    { name: 'convertTransform', params: { floatPrecision } },
    'inlineStyles',
    { name: 'mergePaths', params: { floatPrecision } },
    'mergeStyles',
    'minifyStyles',
    'moveElemsAttrsToGroup',
    'moveGroupAttrsToElems',
    'removeComments',
    'removeDesc',
    'removeDoctype',
    'removeEditorsNSData',
    'removeEmptyAttrs',
    'removeEmptyContainers',
    'removeEmptyText',
    'removeHiddenElems',
    'removeMetadata',
    'removeNonInheritableGroupAttrs',
    'removeOffCanvasPaths',
    'removeScriptElement',
    'removeTitle',
    'removeUnknownsAndDefaults',
    'removeUnusedNS',
    'removeUselessDefs',
    'removeUselessStrokeAndFill',
    'removeViewBox',
    'removeXMLNS',
    'removeXMLProcInst',
    // 'reusePaths', - Can't be enabled as it generates new IDs.
    'sortAttrs',
    'sortDefsChildren'
  ]
}

export default class OptimizeSvgStep extends ActionStepBase {
  constructor (
    private readonly getText: () => string,
    private readonly storeResult: (optimized: string) => void
  ) {
    super(
      'optimizeSvgStep',
      [],
      () => []
    )
  }

  async execute (): Promise<void> {
    this.storeResult(await iterativelyMinify(
      this.getText(),
      async previous => (Svgo.optimize(previous, options)).data
    ))
  }
}
