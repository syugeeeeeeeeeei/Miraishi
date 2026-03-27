# 修正内容の確認

## 変更概要

円形メニューの見切れを防ぐために、表示位置・角度・サイズを再調整した。
同時に、税金ルールIPCハンドラが未登録の環境でも、ダイアログ表示と再計算反映が継続するようフォールバックを実装した。

## 主な変更

- `SystemRadialMenu.tsx`
  - 半径を縮小し、展開角度を右寄せアークへ変更。
  - 展開アイコンと歯車アイコンを小型化。
  - ベース位置を右寄せに変更し、左端見切れを抑制。

- `ControlPanel/index.tsx`
  - `get-tax-schema` 未登録エラーを検出した場合、内蔵デフォルトスキーマでダイアログを開く処理を追加。
  - `update-tax-schema` 未登録時は、セッション内の税スキーマオーバーライドで再計算を適用する処理を追加。

- `store/atoms.ts` / `preload/index.ts` / `main/index.ts`
  - `taxSchemaOverride` を `calculate-prediction` に渡せるよう拡張。
  - メイン側で override を受け取って検証し、計算へ使用。

- `constants/defaultTaxSchema.ts`
  - フォールバック用の内蔵税スキーマ定数を追加。

## 検証結果

- `yarn typecheck` 成功
- `yarn test --run src/main/lib/calculator.spec.ts` 成功（8 tests passed）
