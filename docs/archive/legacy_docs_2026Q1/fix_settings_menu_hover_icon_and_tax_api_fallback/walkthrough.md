# 修正内容の確認

## 実装概要

設定メニュー操作時の誤動作（ホバーでのパネル展開）を抑制し、設定アイコン群を大きく調整した。
また、税金ルールAPIが未定義の実行環境でも動作するよう呼び出し互換フォールバックを追加した。

## 主な変更

- `ControlPanel/index.tsx`
  - ホバー開閉ロジックを `onMouseMove` ベースへ変更。
  - 設定メニューゾーン上では自動展開しない判定を追加。
  - 設定ゾーン進入時に開閉タイマーを停止する処理を追加。
  - 税金ルールAPI呼び出しにフォールバックを追加:
    - 優先: `window.api.getTaxSchema` / `window.api.updateTaxSchema`
    - 代替: `window.electron.ipcRenderer.invoke('get-tax-schema' / 'update-tax-schema')`

- `SystemRadialMenu.tsx`
  - 歯車ボタンと展開アイコンを大型化。
  - 円形メニュー半径・角度を調整して視認性を改善。
  - 設定メニューゾーンの enter/leave を親へ通知するプロップを追加。

## 検証結果

- `yarn typecheck` 成功
- `yarn test --run src/main/lib/calculator.spec.ts` 成功（8 tests passed）
