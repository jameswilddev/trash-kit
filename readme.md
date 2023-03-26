# trash-kit [![Continuous Integration](https://github.com/jameswilddev/trash-kit/workflows/Continuous%20Integration/badge.svg?branch=master)](https://github.com/jameswilddev/trash-kit/actions?query=workflow%3A%22Continuous+Integration%22) [![License](https://img.shields.io/github/license/jameswilddev/trash-kit.svg)](https://github.com/jameswilddev/trash-kit/blob/master/license) [![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fjameswilddev%2Ftrash-kit.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fjameswilddev%2Ftrash-kit?ref=badge_shield) [![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com/)

This repository is intended to be a "one-stop shop" for building a subset of
types of [Js13kGames](https://js13kgames.com/) entries.  It is a re-working of
[junk-kit](https://github.com/SUNRUSE/junk-kit).  It features:

- A "watch" pipeline including minification, zipping and size checking for
  realtime feedback on how your changes affect artifact size.

- Game-specific and shared codebases combined during the build pipeline.

- Code generation from content, for better minification and build-time type
  checks.

- Hot reload.

- Continuous integration.

See an [example game](src/games/tower-of-hanoi/src)!

## Usage

### First steps

- If you don't have a GitHub account, sign up for free.

- Fork this repository.  This makes your own copy which you can edit to your
  heart's content.  To do this, click `Fork` in the top right corner of this
  repository's page on GitHub.

- Change all references to `jameswilddev/trash-kit` (links in this file,
  `package.json`, license, GitHub Actions, etc.) to point to your fork; noting
  that some of these will be URL-encoded, i.e. `jameswilddev%2Ftrash-kit`.

### Development

#### First time

- Install [Git](https://git-scm.com/).

- Install [Visual Studio Code](https://code.visualstudio.com/).

- Install [Node.js](https://nodejs.org/en/).  I'd recommend LTS.

- Clone this repository.

  You can do this by opening Visual Studio Code, pressing F1, then entering
  `clone` and pressing enter to select `Git: Clone`.

  You will then be prompted for the URL of your forked repository, then, a place
  to clone it into.  Once it is done, a blue `Open Repository` button will
  appear in the bottom right.  Click on it.

#### Every time

- Open Visual Studio Code if it is not open.

- If something other than your project is open, click `File`, `Open Folder` and
  select the folder you cloned your fork to.

- Press Ctrl+Shift+B and you should see a command-line application start in the
  terminal at the bottom of Visual Studio Code.

- Your games should now be testable at `http://localhost:3333/`.

- Any changes you make, to code or content, will be reflected there
  automatically.

- You can scan the displayed QR code to open your games on your phones or
  tablets for testing purposes.

See `File structure` for details on adding new or modifying existing games.

### Continuous Integration

By default, a GitHub Action will build every game in your repository and make
the HTML and zip files available as artifacts attached to the builds.

There are additionally basic "smoke tests", which launch the included
`tower-of-hanoi` in a headless Chrome and ensure that some basic features work.
Removing or significantly changing this game and/or the included engine are
likely to break these tests, so you may need to either replace them or remove
them entirely.  You can quickly disable them by removing `- run: npm test` from
`.github/workflows/continuous-integration.yaml`.

#### Optional

The following continuous integration services may be useful for forks of the
build pipeline, but are less useful for making your own games.

##### Renovate

This means that any updates to the tools used to build games will be presented
to you as GitHub pull requests in your fork.

- Click `Install` at (https://github.com/apps/renovate).
- Either select `All Repositories` or `Only select repositories` and ensure that
  `trash-kit` is selected.

##### FOSSA

This means that your fork's dependencies will be checked to ensure that their
licenses do not conflict or present unexpected obligations.

- Sign up with GitHub at [FOSSA](https://fossa.com/).
- Follow the profile setup steps.  For `Set Default Policy`,
  `Standard Bundle Distribution` is probably good enough.
- Choose `Quick Import`.
- Choose `GitHub`.
- Click `Connect With Service`.
- Tick `trash-kit`.
- Click `Import 1`.
- Update all FOSSA links in this file to point to your fork (change
  `jameswilddev` to your GitHub name).

## File structure

### Notation

#### `{game-name}`

Up to 50 characters, where:

- The first character is a lower case letter.

- The last character is a lower case letter or digit

- Every other character is a lower case letter, digit or hypen.

#### `{file-path}`

Any file path (including files within folders), where:

- The first character is a lower case letter.

- The last character is a lower case letter or digit

- Every other character is a lower case letter, digit or hyphen.

- Hyphens are forbidden immediately preceding or following a folder separator
  (`/` or `\`).

### Paths

#### `src/engine/src/{file-path}.ts`

TypeScript which is included in every game.

#### `src/engine/src/{file-path}.d.ts`

Defines types which the engine expects games to define.

#### `src/engine/src/index.pug`

Rendered as `index.html` in zipped games.  The following variables are defined:

| Name                          | Description                                     |
| ----------------------------- | ----------------------------------------------- |
| `javascript`                  | The minified JavaScript generated for the game. |
| `safeAreaWidthVirtualPixels`  | Imported from `metadata.json`.                  |
| `safeAreaHeightVirtualPixels` | Imported from `metadata.json`.                  |
| `backgroundColor`             | Imported from `metadata.json`.                  |

#### `src/games/{game-name}/metadata.json`

Static data regarding the game.  Must resemble the following:

```json
{
  "safeAreaWidthVirtualPixels": 640,
  "safeAreaHeightVirtualPixels": 480,
  "backgroundColor": "#a4c"
}
```

##### `safeAreaWidthVirtualPixels`/`safeAreaWidthVirtualPixels`

These define the width and height of the "safe area", in SVG pixels.  This is
centered on the page, and scaled up to be as large as possible without being
cropped.

If the page's aspect ratio does not match that of the safe area, the extra space
to the top and bottom or left and right will be visible; the game is not cropped
to the safe area.

The top left corner of the safe area is at X 0, Y 0 in SVG pixels.  The X axis
extends to the right, while the Y axis extends to the bottom.

##### `backgroundColor`

The background color of the page.  This must be a three-character hex code in
lower case.

#### `src/games/{game-name}/src/{file-path}.ts`

TypeScript included in the game.

#### `src/games/{game-name}/src/{file-path}.svg`

SVG minified and included in the game's TypeScript global scope.  For instance,
`src/games/test-game-name/src/complex-multi-level/folder-structure/with-a-file.svg`
will be available in the game's TypeScript global scope as a constant called
`complexMultiLevel_folderStructure_withAFile_svg`, of a type called
`ComplexMultiLevel_folderStructure_withAFile_svg`.

Additionally, a type is generated called `AnySvg`, which is the union of all of
the types generated to represent SVG files.

#### `dist/{game-name}.zip`

The built game artifact.

## Engine

The included game engine is a little unconventional, and may not be appropriate
for your own games.

It is optimised for:

- Small artifact size.
- Hot reload.
- Resolution independence.
- Low system load during inactivity.
- Mouse or touch input.

It is not good for:

- Complex animation.
- Physics.
- Keyboard or gamepad input.

### Architecture

```
initial -.-> state -> render -> viewports -.-> groups/sprites/rectangles/text
         |                                 '-> click handlers -.
         '-----------------------------------------------------'
```

#### State

All mutable game state is stored in a single JSON-serializable object called
`state`.  This is loaded from local storage if available, with fallback to an
initial state.

### Namespacing

The build system does not make use of any kind of bundling or closures to keep
your game and engine code separate.  This is to give the minification process
the best chance at creating the smallest build artifacts.

For that reason, avoid referencing or defining anything prefixed `engine` or
`Engine` on the global scope within game code.  This is likely an internal
implementation detail which could break in future engine updates.

### To be defined by your game

The following must be defined by your game TypeScript for building to succeed.

#### `State`

A JSON-serializable type which contains all mutable state for your game.

If breaking changes are made to this (such as changing the JSON which would be
de/serialized in such a way that state recovered from local storage would no
longer work) please change `version`.

#### `initial`

A function which returns a new instance of the default state, used when local
storage does not contain a state, or the state is not usable.

#### `version`

A number which identifies breaking changes to `State`.  If this does not match
that loaded from local storage, `initial` will be used instead.

#### `render`

```typescript
function render(): void {
  // Use render helpers here.
}
```
Executed when `state` is known to have changed, to re-render the scene.  See
Render Emitters for details on what can be done in this callback.

##### Mutation callbacks

A mutation callback is executed when an event occurs which could alter state,
and will be followed by a re-`render`.

### Defined by the engine

#### `gameName`

The name of the game from its path under `src/games`, as a string.

#### `safeAreaWidthVirtualPixels`

Imported from `metadata.json`.

#### `safeAreaHeightVirtualPixels`

Imported from `metadata.json`.

#### `state`

The current state; modify as you please.

#### `Falsy`

Represents any value which is "falsy".

#### `Truthiness`

Either `1` or `undefined`.  Useful for indicating a `true`/`false` flag without
the overhead of `return !1` or similar.

#### `Json`

Types which can be serialized to or deserialized from JSON.

#### `linearInterpolate`

Linearly interpolates between two values by a unit interval, extrapolating if
that mix value leaves the 0...1 range.

#### `dotProduct`

```typescript
console.log(dotProduct(3, 4, 5, 6)) // 39
```

Calculates the dot product of two vectors.

#### `magnitudeSquared`

```typescript
console.log(magnitudeSquared(3, 4)) // 15
```

Calculates the square of the magnitude of a vector.

#### `magnitude`

```typescript
console.log(magnitude(3, 4)) // 3.872983346
```

Calculates the magnitude of a vector.

#### `distanceSquared`

```typescript
console.log(distanceSquared(8, 20, 5, 16)) // 15
```

Calculates the square of the distance between two vectors.

#### `distance`

```typescript
console.log(distance(8, 20, 5, 16)) // 3.872983346
```

Calculates the distance between two vectors.

#### Render helpers

These can be used during the render callback to describe something which the
render emits.

#### Objects

##### `root`

This represents the scene itself, and can be used as the parent of other objects.

##### `group`

This is an object which is not, itself, visible, but can be used to transform or
filter other objects as a single unit.

```typescript
const object = group(parentRootOrGroup)
```

##### `sprite`

This shows an imported SVG.

```typescript
const object = sprite(parentRootOrGroup, any_imported_svg)
```

##### `rectangle`

This creates a rectangle.  It can optionally be assigned a fill color.

```typescript
const invisible = rectangle(parentRootOrGroup, 200, 100)
const magenta = rectangle(parentRootOrGroup, 200, 100, `f0f`)
```

The rectangle is positioned in the top left corner.

These are usually used to accept user input.

##### `text`

This creates text.  Newlines are not supported.

```typescript

// Displayed in black with the browser's default "serif" font at size 16px;
// the origin is at the bottom left corner.
const a = text(parentRootOrGroup, `Example Text`)

// As above, but with the browser's default "sans serif" font instead.
const b = text(parentRootOrGroup, `Example Text`, `sans-serif`)

// As above, but in magenta.
const c = text(parentRootOrGroup, `Example Text`, `sans-serif`, `f0f`)

// As above, but the origin is the middle of the bottom edge.
const d = text(parentRootOrGroup, `Example Text`, `sans-serif`, `f0f`, `middle`)

// As above, but the origin is the bottom right corner.
const e = text(parentRootOrGroup, `Example Text`, `sans-serif`, `f0f`, `end`)

// As above, but the origin is the middle of the right edge.
const f = text(parentRootOrGroup, `Example Text`, `sans-serif`, `f0f`, `end`, `middle`)

// As above, but the origin is the top right corner.
const g = text(parentRootOrGroup, `Example Text`, `sans-serif`, `f0f`, `end`, `hanging`)
```

#### Input

##### `click`

Specify a callback to execute when a group, sprite, rectangle or text is clicked
on or tapped.

```typescript
click(object, () => {
  state.value = `changed`
})
```

This is a render callback; as a consequence, you can freely edit the state here
and the scene will be re-rendered after the callback completes.

#### Animation

Each of these functions can be used the same way; apply transforms and filters,
execute one of these functions, then apply transforms and filters to animate to.

Only *one* animation can be applied per object per render.

```typescript
const object = rectangle(root, 100, 50, `f0f`)
transform(object, [scale(2, 1)])
filter(object, [hueRotate(120)])

linear(object, 2)

transform(object, [scale(0.5, 1)])
filter(object, [hueRotate(240)])
```

Groups, sprites, rectangles and text can be animated.

##### `delay`

No interpolation is performed; the transform and filter change immediately after
the specified duration.

```typescript
// Set transform/filter to hold for 2 seconds.

delay(object, 2)

// Set transform/filter to hold after 2 seconds.
```

##### `linear`

Transform and filter change linearly (without acceleration or deceleration) over
the specified duration.

```typescript
// Set transform/filter to linearly interpolate from.

linear(object, 2)

// Set transform/filter to linear interpolate to.
```

##### `easeOut`

Transform and filter change quickly at first, then gently decelerate over the
specified duration.

```typescript
// Set transform/filter to decelerate from.

easeOut(object, 2)

// Set transform/filter to decelerate to.
```

##### `easeIn`

Transform and filter change slowly at first, then gently accelerate over the
specified duration.

```typescript
// Set transform/filter to accelerate from.

easeIn(object, 2)

// Set transform/filter to accelerate to.
```

##### `ease`

Transform and filter change with slightly abrupt acceleration and deceleration.

```typescript
// Set transform/filter to accelerate from.

ease(object, 2)

// Set transform/filter to decelerate to.
```

##### `easeInOut`

Transform and filter change with smooth acceleration and deceleration.

```typescript
// Set transform/filter to accelerate from.

easeInOut(object, 2)

// Set transform/filter to decelerate to.
```

#### Transforms

These can be strung together to describe transformations applied to groups,
sprites, rectangles and text.

Apply them using the `transform` function:

```typescript
transform(object, [translate(20, 65), rotate(90)])
```

##### `translate`

```typescript
translate(20, 65)
```

Translates by the given numbers of virtual pixels on the X and Y axes
respectively.

##### `rotate`

```typescript
rotate(90)
```

Rotates by the given number of degrees clockwise.

Scales by the given factor on the Y axis.

##### `scale`

```typescript
scale(2, 4)
```

Scales by the given factors on the X and Y axes respectively.

##### `scaleUniform`

```typescript
scaleUniform(2)
```

Scales by the given factor on the X and Y axes.

#### Filters

These can be strung together to describe postprocessing effects applied to
groups, sprites, rectangles and text.

Apply them using the `filter` function:

```typescript
filter(object, [brightness(0.5), soften(20)])
```

##### `soften`

```typescript
soften(20)
```

Blurs with a radius of the given virtual pixels.

##### `brightness`

```typescript
brightness(0.5)
```

Adjusts brightness by the given factor.

##### `contrast`

```typescript
contrast(0.5)
```

Adjusts contrast by the given factor.

##### `sharpDropShadow`

```typescript
sharpDropShadow(20, 40)        // Black.
sharpDropShadow(20, 40, `f0f`) // Magenta.
```

Produces a sharp-edged drop shadow, offset by the given numbers of virtual
pixels on the X and Y axes.  A color may optionally be specified, as a
three-character hex code in lower case; if no color is specified, the shadow is
black.

##### `softDropShadow`

```typescript
softDropShadow(20, 40, 5)        // Black.
softDropShadow(20, 40, 5, `f0f`) // Magenta.
```

Produces a soft-edged drop shadow, offset by the given numbers of virtual
pixels on the X and Y axes.  The blur radius is specified in virtual pixels.  A
color may optionally be specified, as a three-character hex code in lower case;
if no color is specified, the shadow is black.

##### `greyscale`

```typescript
greyscale(0.5)
```

Reduces saturation by the given factor.

##### `hueRotate`

```typescript
hueRotate(180)
```

"Rotates" colors by the specified number of degrees.  For example, a value of
120 would replace red with blue, blue with green and green with red.

##### `invert`

```typescript
invert(1)
```

Inverts colors; 1 is a full inversion of color, while 0 has no effect.

##### `opacity`

```typescript
opacity(0.5)
```

Multiplies opacity by the given factor.

##### `saturate`

```typescript
saturate(0.5)
```

Multiplies saturation by the given factor.

##### `sepia`

```typescript
sepia(0.5)
```

Applies a sepia filter with the given opacity.

#### Mutation Callback Helpers

These are intended to be used only during a mutation callback.

#### `saveLoadAvailable`

When returns truthy, mutation callbacks' `save`, `load` and `drop` are likely to
work.

When returns falsy, mutation callbacks' `save`, `load` and `drop` will
definitely not work.

##### `save`

Saves a JSON-serializable object under the given string key.

Returns truthy when successful.

Returns falsy and has no side effects when unsuccessful.

```typescript
const truthyOnSuccess = save(`a-key`, aJsonSerializableValue)
```

##### `load`

Loads the JSON-serializable object with the given key.  Makes no attempt to
ensure that the deserialized object matches the specified type.

Returns the deserialized object when successful.

Returns `null` when unsuccessful or not previously saved.

```typescript
const deserializedOrNull = load<AJsonSerializableType>(`a-key`)
```

##### `drop`

Deletes the object with the given string key.

Returns truthy when successful, including when no such object exists.

Returns falsy and has no side effects when unsuccessful.

```typescript
const truthyOnNonFailure = drop(`a-key`)
```

## Build pipeline

The build pipeline is implemented using Node.JS and TypeScript.

There are two entry points: `src/pipeline/cli.ts` and `src/pipeline/ci.ts`, for
their respective usages.  These should produce the same artifacts, but while
`cli` is intended for local development purposes (watch builds, does not stop
on error, hosts build artifacts via HTTP with hot reload), `ci` is instead
intended for continuous integration environments (stops on first error or
executed plan, logs more heavily).

### Architecture

```
files -> diff -> planning -> steps -> artifacts
                              | ^
                              v |
                             stores
```

- A file source produces a list of file paths and corresponding version
  identifiers.

- A diff algorithm determines which files have been added, deleted, modified and
  remain the same.

- A planning algorithm generates a hierarchy of build steps need to be executed
  based on the diff.

- The steps execute, caching to a set of stores.

- Build artifacts are written to disk.

### Debugging

The most error-prone part of the build pipeline is planning; it can be difficult
to determine exactly which steps should be executed based on the given diff.

To make it easier to determine exactly which steps were planned, it is possible
to query the hierarchy for a [nomnoml](https://www.nomnoml.com/) document
detailing exactly which steps were planned to be executed and in what order.

To do this, run `npm run-script nomnoml`.

## License

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fjameswilddev%2Ftrash-kit.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fjameswilddev%2Ftrash-kit?ref=badge_large)
