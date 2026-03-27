import { spawnSync } from 'node:child_process'
import process from 'node:process'

const publishMode = process.env.ELECTRON_BUILDER_PUBLISH ?? 'always'
const builderArgs = ['electron-builder', '--win', '--publish', publishMode]

const hasWine = () => {
  if (process.platform !== 'linux') {
    return true
  }

  const result = spawnSync('wine', ['--version'], { stdio: 'ignore' })
  return result.status === 0
}

if (process.platform === 'linux' && !hasWine()) {
  console.warn('[deploy:win] wine が見つからないため、Windows成果物を zip で生成します。')
  console.warn(
    '[deploy:win] NSIS インストーラー(.exe)が必要な場合は wine を導入し、`yarn deploy:win:nsis` を実行してください。'
  )
  builderArgs.splice(2, 0, 'zip')
}

const result = spawnSync('yarn', builderArgs, {
  stdio: 'inherit',
  shell: process.platform === 'win32'
})

if (result.error) {
  console.error('[deploy:win] 実行に失敗しました:', result.error.message)
  process.exit(1)
}

process.exit(result.status ?? 1)
