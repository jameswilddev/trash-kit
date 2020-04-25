import * as path from "path"
import StepBase from "../../steps/step-base"
import ParseTypeScriptStep from "../../steps/actions/type-script/parse-type-script-step"
import environmentParsedDebugStore from "../../stores/environment-parsed-debug-store"
import environmentParsedProductionStore from "../../stores/environment-parsed-production-store"

export default function (debug: boolean): ReadonlyArray<StepBase> {
  const steps: ParseTypeScriptStep[] = [
    new ParseTypeScriptStep(
      path.join(`.generated-type-script`, `environment.ts`),
      () => `const engineDebug = false`,
      parsed => environmentParsedProductionStore.set(parsed)
    )
  ]

  if (debug) {
    steps.push(new ParseTypeScriptStep(
      path.join(`.generated-type-script`, `environment.ts`),
      () => `const engineDebug = true`,
      parsed => environmentParsedDebugStore.set(parsed)
    ))
  }

  return steps
}
