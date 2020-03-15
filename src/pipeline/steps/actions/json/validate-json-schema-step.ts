import * as jsonschema from "jsonschema"
import * as types from "../../../types"
import StepBase from "../../step-base"
import ActionStepBase from "../action-step-base"

export default class ValidateJsonSchemaStep extends ActionStepBase {
  constructor(
    private readonly getJson: () => types.Json,
    private readonly getSchema: () => jsonschema.Schema,
  ) {
    super(
      `validateJsonSchema`,
      [],
      (self: StepBase) => []
    )
  }

  async execute(): Promise<void> {
    const result = jsonschema.validate(this.getJson(), this.getSchema())

    if (!result.valid) {
      throw new Error(`JSON schema validation failed:${result.errors.map(error => `\n\t${error.property} - ${error.message}`)}`)
    }
  }
}
