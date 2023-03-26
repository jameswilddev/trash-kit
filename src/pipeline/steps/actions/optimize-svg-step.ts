import * as Svgo from "svgo";
import StepBase from "../step-base"
import ActionStepBase from "./action-step-base"
import iterativelyMinify from "../../utilities/iteratively-minify"

const floatPrecision = 0

const options: Svgo.Config = {
  multipass: false,
  floatPrecision,

  plugins: [
    'cleanupAttrs',
    'cleanupEnableBackground',
    'cleanupIds',
    'cleanupListOfValues',
    'cleanupNumericValues',
    'collapseGroups',
    'convertColors',
    'convertEllipseToCircle',
    'convertPathData',
    'convertShapeToPath',
    'convertStyleToAttrs',
    'convertTransform',
    'inlineStyles',
    'mergePaths',
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
    'reusePaths',
    'sortAttrs',
    'sortDefsChildren'
  ],
};

export default class OptimizeSvgStep extends ActionStepBase {
  constructor(
    private readonly getText: () => string,
    private readonly storeResult: (optimized: string) => void
  ) {
    super(
      `optimizeSvgStep`,
      [],
      (self: StepBase) => []
    )
  }

  async execute(): Promise<void> {
    this.storeResult(await iterativelyMinify(
      this.getText(),
      async previous => (Svgo.optimize(previous, options)).data
    ))
  }
}
