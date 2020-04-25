import compilerOptions from "./compiler-options"

export default {
  ...compilerOptions,
  jsx: `preserve`,
  module: `None`,
  moduleResolution: `node`,
  target: `ES3`,
}
