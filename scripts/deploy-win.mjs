import { spawnSync } from 'node:child_process'
import process from 'node:process'

const publishMode = process.env.ELECTRON_BUILDER_PUBLISH ?? 'never'
const builderArgs = ['electron-builder', '--win', '--publish', publishMode]

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const hasWine = () => {
  if (process.platform !== 'linux') {
    return true
  }

  const result = spawnSync('wine', ['--version'], { stdio: 'ignore' })
  return result.status === 0
}

if (process.platform === 'linux' && !hasWine()) {
  console.warn('[package:win] wine が見つからないため、Windows成果物を zip で生成します。')
  console.warn(
    '[package:win] NSIS インストーラー(.exe)を公開する場合は wine を導入し、`yarn release:win` を実行してください。'
  )
  builderArgs.splice(2, 0, 'zip')
}

const result = spawnSync('yarn', builderArgs, {
  stdio: 'inherit',
  shell: process.platform === 'win32'
})

if (result.error) {
  console.error('[package:win] 実行に失敗しました:', result.error.message)
  process.exit(1)
}

process.exit(result.status ?? 1)
