import * as path from 'path'
import type Diff from '../../../files/diff'
import type StepBase from '../../../steps/step-base'
import ParallelStep from '../../../steps/aggregators/parallel-step'
import DeleteStep from '../../../steps/actions/files/delete-step'
import WriteFileStep from '../../../steps/actions/files/write-file-step'
import tsconfigContent from '../../../steps/actions/type-script/tsconfig-content'
import SerialStep from '../../../steps/aggregators/serial-step'
import ReadTextFileStep from '../../../steps/actions/files/read-text-file-step'
import vscodeSettingsInputTextStore from '../../../stores/vscode-settings-input-text-store'
import vscodeSettingsOutputTextStore from '../../../stores/vscode-settings-output-text-store'
import ArbitraryStep from '../../../steps/actions/arbitrary-step'
import DeleteFromValueStoreIfSetStep from '../../../steps/actions/stores/delete-from-value-store-if-set-step'

export default function (
  games: Diff<string>
): StepBase {
  const tsconfigAdditions: readonly StepBase[] = [...games
    .added
  ].map(game => new WriteFileStep(
    () => JSON.stringify({
      include: [
        path.join('src', '.declarations.ts'),
        path.join('src', '**', '*.ts'),
        path.join('..', '..', 'engine', 'src', '**', '*.ts')
      ],
      exclude: [
        path.join('..', '..', 'engine', 'src', '**', '*.d.ts')
      ],
      compilerOptions: tsconfigContent
    }),
    path.join('src', 'games', game, 'tsconfig.json')
  ))

  const eslintAdditions: readonly StepBase[] = [...games
    .added]
    .map(game => new WriteFileStep(
      () => JSON.stringify({
        env: {
          browser: true,
          es2021: true,
          node: false
        },
        extends: 'standard-with-typescript',
        overrides: [],
        parserOptions: {
          ecmaVersion: 'latest',
          sourceType: 'module',
          project: 'tsconfig.json'
        },
        rules: {
          '@typescript-eslint/strict-boolean-expressions': 'off'
        }
      }
      ),
      path.join('src', 'games', game, '.eslintrc.json')
    ))

  const tsconfigDeletions: readonly StepBase[] = [...games
    .deleted]
    .map(game => new DeleteStep(
      path.join('src', 'games', game, 'tsconfig.json'))
    )

  const eslintDeletions: readonly StepBase[] = [...games
    .deleted]
    .map(game => new DeleteStep(
      path.join('src', 'games', game, '.eslintrc.json'))
    )

  const steps = [...tsconfigAdditions, ...eslintAdditions, ...tsconfigDeletions, ...eslintDeletions]

  if (games.requiresClean()) {
    steps.push(new SerialStep('updateEslintWorkingDirectories', [
      new ReadTextFileStep(path.join('.vscode', 'settings.json'), (text) => { vscodeSettingsInputTextStore.set(text) }),
      new ArbitraryStep('updateEslintWorkingDirectories', async () => {
        const inputText = vscodeSettingsInputTextStore.get()
        const inputJson: { 'eslint.workingDirectories': readonly string[] } = JSON.parse(inputText)

        const outputJson = {
          ...inputJson,
          'eslint.workingDirectories': [
            path.join('src', 'engine'),
            ...[...games.added, ...games.unmodified, ...games.updated].map(game => path.join('src', 'games', game)),
            path.join('src', 'pipeline')
          ]
        }

        const outputText = `${JSON.stringify(outputJson, null, 2)}\n`
        vscodeSettingsOutputTextStore.set(outputText)
      }),
      new ParallelStep('postGeneration', [
        new DeleteFromValueStoreIfSetStep(vscodeSettingsInputTextStore),
        new SerialStep('write', [
          new WriteFileStep(() => vscodeSettingsOutputTextStore.get(), path.join('.vscode', 'settings.json')),
          new DeleteFromValueStoreIfSetStep(vscodeSettingsOutputTextStore)
        ])
      ])
    ]))
  }

  return new ParallelStep(
    'tsconfig',
    steps
  )
}
