import * as path from 'path'
import type Diff from '../../../files/diff'
import type StepBase from '../../../steps/step-base'
import ParallelStep from '../../../steps/aggregators/parallel-step'
import DeleteStep from '../../../steps/actions/files/delete-step'
import WriteFileStep from '../../../steps/actions/files/write-file-step'
import tsconfigContent from '../../../steps/actions/type-script/tsconfig-content'

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
          project: path.join('src', 'games', game, 'tsconfig.json')
        },
        rules: {}
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

  return new ParallelStep(
    'tsconfig',
    tsconfigAdditions.concat(eslintAdditions).concat(tsconfigDeletions).concat(eslintDeletions)
  )
}
