import * as childProcess from "child_process"
import * as os from "os"
import * as fs from "fs"
import * as path from "path"
import "jasmine"
import * as uuid from "uuid"
import * as pngjs from "pngjs"
import * as puppeteer from "puppeteer"
import pixelmatch = require("pixelmatch")
import * as extractZip from "extract-zip"

let productionHtml: string
let productionZip: string
let debug: childProcess.ChildProcess

beforeAll(async () => {
  await new Promise((resolve, reject) => childProcess.exec(`npm run ci`, error => {
    if (error) {
      reject(error)
    }

    resolve()
  }))

  productionHtml = path.join(os.tmpdir(), `${uuid.v4()}.html`)
  productionZip = path.join(os.tmpdir(), `${uuid.v4()}.zip`)

  await fs.promises.copyFile(path.join(`dist`, `tower-of-hanoi.html`), productionHtml)
  await fs.promises.copyFile(path.join(`dist`, `tower-of-hanoi.zip`), productionZip)

  debug = childProcess.exec(`npm run cli`)
  await new Promise(resolve => setTimeout(resolve, 10000))
}, 100000)

afterAll(async () => {
  await fs.promises.unlink(productionHtml)
  await fs.promises.unlink(productionZip)
  debug.kill()
})

function run(
  name: ReadonlyArray<string>,
  url: () => string,
  width: number,
  height: number,
  clicks: ReadonlyArray<[number, number]>,
): void {
  it(name.join(` `), async () => {
    const browser = await puppeteer.launch({ defaultViewport: { width, height } })
    const page = await browser.newPage()
    await page.goto(url())
    await new Promise(resolve => setTimeout(resolve, 250))

    for (const click of clicks) {
      await page.mouse.click(click[0], click[1])
      await new Promise(resolve => setTimeout(resolve, 250))
    }

    const actualBytes = await page.screenshot({ encoding: `binary` })
    await browser.close()

    const expectedBytes = await fs.promises.readFile(path.join(__dirname, `${name.join(`-`)}.png`))
    const expectedPng = pngjs.PNG.sync.read(expectedBytes)
    const actualPng = pngjs.PNG.sync.read(actualBytes)

    const mismatchingPixels = pixelmatch(expectedPng.data, actualPng.data, null, width, height, { threshold: 0.01 })
    expect(mismatchingPixels).toBeLessThan(50) // It's quite normal for antialiasing, etc. to be slightly off.
  }, 100000)
}

describe(`production`, () => {
  describe(`the zip file`, () => {
    let extractedZip: string

    beforeAll(async () => {
      extractedZip = path.join(os.tmpdir(), `${uuid.v4()}`)
      await extractZip(productionZip, { dir: extractedZip })
    })

    afterAll(async () => {
      await fs.promises.rmdir(extractedZip, { recursive: true })
    })

    it(`includes the html file`, async () => {
      const expected = await fs.promises.readFile(productionHtml, `utf-8`)
      const actual = await fs.promises.readFile(path.join(extractedZip, `index.html`), `utf-8`)

      expect(actual).toEqual(expected)
    })

    it(`includes no other files`, async () => {
      const files = await fs.promises.readdir(extractedZip)
      expect(files).toEqual([`index.html`])
    })
  })

  function runProduction(
    description: ReadonlyArray<string>,
    width: number,
    height: number,
    clicks: ReadonlyArray<[number, number]>,
  ): void {
    run(description, () => `file://${productionHtml}`, width, height, clicks)
  }

  runProduction([`production`, `initial`, `landscape`], 2000, 480, [])
  runProduction([`production`, `initial`, `portrait`], 480, 2000, [])
  runProduction([`production`, `one`, `click`, `landscape`], 2000, 480, [[800, 200]])
  runProduction([`production`, `one`, `click`, `portrait`], 480, 2000, [[100, 950]])
  runProduction([`production`, `two`, `clicks`, `landscape`], 2000, 480, [[800, 200], [1200, 300]])
  runProduction([`production`, `two`, `clicks`, `portrait`], 480, 2000, [[100, 950], [400, 1050]])
  runProduction([`production`, `three`, `clicks`, `landscape`], 2000, 480, [[800, 200], [1200, 300], [800, 200]])
  runProduction([`production`, `three`, `clicks`, `portrait`], 480, 2000, [[100, 950], [400, 1050], [100, 950]])
  runProduction([`production`, `four`, `clicks`, `landscape`], 2000, 480, [[800, 200], [1200, 300], [800, 200], [1000, 300]])
  runProduction([`production`, `four`, `clicks`, `portrait`], 480, 2000, [[100, 950], [400, 1050], [100, 950], [240, 1000]])
})

describe(`debug`, () => {
  function runDebug(
    description: ReadonlyArray<string>,
    width: number,
    height: number,
    clicks: ReadonlyArray<[number, number]>,
  ): void {
    run(description, () => `http://127.0.0.1:3333`, width, height, clicks)
  }

  it(`deletes "dist"`, async () => {
    const files = await fs.promises.readdir(`.`)
    expect(files).not.toContain(`dist`)
  })

  runDebug([`debug`, `initial`, `landscape`], 2000, 480, [])
  runDebug([`debug`, `initial`, `portrait`], 480, 2000, [])
  runDebug([`debug`, `one`, `click`, `landscape`], 2000, 480, [[800, 200]])
  runDebug([`debug`, `one`, `click`, `portrait`], 480, 2000, [[100, 950]])
  runDebug([`debug`, `two`, `clicks`, `landscape`], 2000, 480, [[800, 200], [1200, 300]])
  runDebug([`debug`, `two`, `clicks`, `portrait`], 480, 2000, [[100, 950], [400, 1050]])
  runDebug([`debug`, `three`, `clicks`, `landscape`], 2000, 480, [[800, 200], [1200, 300], [800, 200]])
  runDebug([`debug`, `three`, `clicks`, `portrait`], 480, 2000, [[100, 950], [400, 1050], [100, 950]])
  runDebug([`debug`, `four`, `clicks`, `landscape`], 2000, 480, [[800, 200], [1200, 300], [800, 200], [1000, 300]])
  runDebug([`debug`, `four`, `clicks`, `portrait`], 480, 2000, [[100, 950], [400, 1050], [100, 950], [240, 1000]])
})
