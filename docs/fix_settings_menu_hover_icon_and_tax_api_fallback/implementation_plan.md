# 実装計画

## 1. ホバー挙動の調整

- パネル自動展開トリガーを `onMouseEnter` 依存から、`onMouseMove` とゾーン判定ベースへ調整する。
- 設定メニュー領域を `data-role="system-menu-zone"` で識別し、この領域上では自動展開タイマーを開始しない。
- 設定メニュー領域に入った時点で自動展開タイマーを明示的にクリアする。

## 2. アイコンサイズの強化

- 歯車アイコンを `54px`、円形メニュー項目を `52px` 程度へ拡大。
- メニュー半径も拡張して、重なりなく視認しやすい円形配置へ調整する。

## 3. 税金ルールAPI呼び出しの互換化

- `window.api.getTaxSchema` / `updateTaxSchema` が存在しない環境向けに、
  `window.electron.ipcRenderer.invoke(...)` へのフォールバックを追加する。
- フォールバック不可時は明示エラーメッセージを表示する。

## 4. 検証

- `yarn typecheck`
- `yarn test --run src/main/lib/calculator.spec.ts`
