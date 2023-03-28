import * as path from 'path'
import * as os from 'os'
import * as uuid from 'uuid'
import * as fs from 'fs'
import * as childProcess from 'child_process'
import * as _7zipBin from '7zip-bin'
import ActionStepBase from './action-step-base'

const exists = async (temporaryDirectory: string): Promise<boolean> => {
  try {
    await fs.promises.stat(temporaryDirectory)
    return true
  } catch (e) {
    if (e instanceof Error && 'code' in e && e.code !== 'ENOENT') {
      return false
    }

    throw e
  }
}

export default class ZipStep extends ActionStepBase {
  constructor (
    private readonly getFiles: () => ReadonlyMap<string, Buffer>,
    private readonly storeResult: (buffer: Buffer) => void
  ) {
    super(
      'zip',
      [],
      () => []
    )
  }

  async execute (): Promise<void> {
    const temporaryDirectory = path.join(os.tmpdir(), uuid.v4())

    try {
      await Promise.all([
        fs.promises.mkdir(temporaryDirectory, { recursive: true }),
        ...Array.from(this.getFiles().entries()).map(async ([subPath, data]) => {
          const filePath = path.join(temporaryDirectory, 'content', subPath)

          await fs.promises.mkdir(path.dirname(filePath), { recursive: true })
          await fs.promises.writeFile(filePath, data)
        })])

      const targetPath = path.join(temporaryDirectory, 'output.zip')

      const stats = await fs.promises.stat(_7zipBin.path7za)

      const executeBits = 73

      if ((stats.mode & executeBits) !== executeBits) {
        await fs.promises.chmod(_7zipBin.path7za, stats.mode | executeBits)
      }

      await new Promise<void>((resolve, reject) => {
        childProcess
          .execFile(_7zipBin.path7za, [
            'a',
            '-mm=Deflate',
            '-mfb=258',
            '-mpass=15',
            '-r',
            targetPath,
            path.join(temporaryDirectory, 'content', '*')
          ])
          .on('error', reject)
          .on('exit', (code: number) => {
            if (code === 0) {
              resolve()
            } else {
              reject(new Error(`7za exited with code ${code} (0 expected).`))
            }
          })
      })

      this.storeResult(await fs.promises.readFile(targetPath))
    } finally {
      if (await exists(temporaryDirectory)) {
        await fs.promises.rm(temporaryDirectory, { recursive: true })
      }
    }
  }
}
