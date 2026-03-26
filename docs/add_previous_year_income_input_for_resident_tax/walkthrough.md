# 修正内容の確認

## 変更概要

住民税の計算を前年ベースへ変更し、前年度収入を入力できるようにした。
これにより、新卒入社など前年度収入が0のケースでは1年目住民税を0円で扱える。

## 実施内容

- 型定義
  - `deductions.previousYearIncome` を追加（未設定時は0想定）。
- バリデーション
  - `previousYearIncome` を `min(0)` で追加し、未設定時は default 0。
- UI
  - 扶養・控除カードに「前年度収入（住民税計算用）」を追加。
  - 新卒向け補助文言を追加。
- 計算ロジック
  - `residentTax` を当年 `taxableIncome` ではなく前年ベースで算出。
  - 各年の `calculationTrace` に住民税計算ベース値と基準種別を追加。
- 計算フロー表示
  - 住民税式を「住民税計算ベース × 税率」に変更し、基準の出所を表示。
- テスト
  - 前年度収入入力値の1年目反映と、2年目への前年課税所得引き継ぎを確認するテストを追加。

## 検証結果

- `yarn test --run src/main/lib/calculator.spec.ts` : 成功（7 tests passed）
- `yarn typecheck` : 成功（node/webともにエラーなし）
