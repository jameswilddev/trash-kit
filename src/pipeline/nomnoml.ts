import * as recursiveReaddir from 'recursive-readdir'
import isMonitored from './files/is-monitored'
import Diff from './files/diff'
import plan from './planning/plan'

async function program (): Promise<void> {
  const files = new Set((await recursiveReaddir('src')).filter(isMonitored))
  const step = plan(new Diff(files, new Set(), new Set(), new Set()), true, false)
  console.log(step.getNomNoml())
}

program().then(
  () => { },
  (error: any) => {
    console.error(error)
    process.exit(1)
  }
)
