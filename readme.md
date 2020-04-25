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

- Your games should now be testable at `http://localhost:3333/{game-name}`,
  where `{game-name}` is the name of a sub-folder of `src/games` such as
  `tower-of-hanoi`, which would be
  `http://localhost:3333/tower-of-hanoi`.

- Any changes you make, to code or content, will be reflected there
  automatically.

See `File structure` for details on adding new or modifying existing games.

### Continuous Integration

By default, a GitHub Action will build every game in your repository and make
the HTML and zip files available as artifacts attached to the builds.

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
will be available in the game's TypeScript global scope as
`complexMultiLevel_folderStructure_withAFile_svg`.

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
initial -.-> state -> render -> viewports -.-> groups/sprites
         |                                 '-> hitboxes --.
         '------------------------------------------------'
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
  // Use render emitters here.
  // Any animations will loop until interrupted by a hitbox.
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

#### Render emitters

These can be called during the render callback to describe something which the
render emits.

#### Transforms

These can be strung together to describe transformations applied to sprites,
groups and hitboxes.

##### `translateX`

```typescript
translateX(20)
```

Translates by the given number of virtual pixels on the X axis.

##### `translateY`

```typescript
translateY(20)
```

Translates by the given number of virtual pixels on the Y axis.

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

##### `scaleX`

```typescript
scaleX(2)
```

Scales by the given factor on the X axis.

##### `scaleY`

```typescript
scaleY(2)
```

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
to query the hierarchy for a [nomnoml](http://www.nomnoml.com/) document
detailing exactly which steps were planned to be executed and in what order.

To do this, call `getNomNoml` on the result of `plan`.

## License

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fjameswilddev%2Ftrash-kit.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fjameswilddev%2Ftrash-kit?ref=badge_large)
