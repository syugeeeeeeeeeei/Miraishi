# 修正内容の確認（分析ウォークスルー）

## 実施日

- 2026-03-27

## 分析サマリー

- 本リポジトリは Electron + React + TypeScript で構成された、キャリア収入シミュレーション用デスクトップアプリ。
- 3層（`main` / `preload` / `renderer`）の責務分離は明確で、ドキュメント（`docs/readmes`）と実装の整合性は高い。
- 税制スキーマを外部 YAML として持ち、UI から編集可能にしている点は拡張性・運用性の強み。
- 一方で、計算ロジックと入力UIの一部に仕様ギャップがあり、手取り予測の精度に影響しうる箇所がある。

## アーキテクチャ整理

1. Main Process
- `src/main/index.ts` で `electron-store` 永続化、IPC、税制スキーマ読込、計算キャッシュを担当。
- `src/main/lib/calculator.ts` が給与・控除・税金計算の中核ロジック。
- `src/main/lib/validators.ts` が Zod で保存時の構造検証を担当。

2. Preload
- `src/preload/index.ts` で `window.api` を公開し、Renderer からの IPC 呼び出しを一元化。

3. Renderer
- `src/renderer/src/store/atoms.ts` でシナリオ/表示設定/計算結果を状態管理。
- `ControlPanel`: シナリオ管理、税制ルール編集（フォーム + YAML）。
- `ScenarioWorkspace`: 入力フォームと結果テーブル、複数シナリオのカルーセル表示。
- `GraphView`: 比較グラフと表示設定。

## ドキュメントと実装の整合

- `docs/readmes/requirements_definition.md` / `specification.md` が定義する「入力→計算→表示→保存」の契約は、実装上おおむね満たされている。
- とくに「UI から直接 OS 資源へアクセスしない」境界は `preload` 経由で守られている。
- ただし、型上はサポートされる機能（例: 手当タイプ）と UI で編集できる機能に差がある。

## 実行検証結果

- `yarn typecheck`: 成功
- `yarn test run`: 成功（`src/main/lib/calculator.spec.ts`, 8 tests）
- `yarn build`: 成功

## 強み

- 層分離が素直で読みやすく、責務の混線が少ない。
- 税制スキーマをコード外に分離し、さらに UI 編集まで提供している。
- 計算結果の `calculationTrace` が充実しており、説明可能性（なぜこの値になったか）が高い。
- 過去タスクの `docs/*` が継続的に蓄積されており、変更履歴の追跡性が高い。

## 主要リスクと改善候補

### 1. 変動残業の有効/無効フラグが計算に反映されない（高）

- 根拠: `src/main/lib/calculator.ts:65-71`
- `scenario.overtime.variableOvertime.enabled` を参照せず、`averageOvertimeHours` があれば常に変動残業代を加算している。
- 影響: UI 上で変動残業を無効にしても、結果に残業代が入りうる。

### 2. 割合手当が期間条件を無視して毎年加算される（高）

- 根拠: `src/main/lib/calculator.ts:123-141`
- `allowance.type === 'percentage'` の分岐が `isAllowanceActive` 判定外にあり、期限付きでも毎年計上される。
- 影響: 長期予測ほど年収が過大になりやすい。

### 3. 月指定手当（`duration.type = months`）が部分年を表現できない（中）

- 根拠: `src/main/lib/calculator.ts:129-131`
- 判定が `year * 12 <= value` のため、18ヶ月手当は「1年目のみ有効」「2年目ゼロ」になり、年跨ぎの部分適用ができない。
- 影響: 短〜中期のシナリオで実態との差が出る。

### 4. シナリオ削除時に計算キャッシュが明示無効化されない（中）

- 根拠: `src/main/index.ts:213-227`（削除時）
- 更新時は無効化処理がある (`src/main/index.ts:195-201`) が、削除時は該当シナリオのキャッシュ削除がない。
- 影響: 長時間利用時のメモリ効率低下の可能性。

### 5. 型上の入力機能と UI 提供機能にギャップがある（中）

- 根拠: `src/types/miraishi.d.ts:20-35`（手当 type は `fixed | percentage`）
- ただし入力UI (`src/renderer/src/components/ScenarioWorkspace/ScenarioInputForm.tsx:375-488`) では手当タイプ選択がなく、実質 `fixed` 前提の入力体験。
- 影響: ドメインモデルの拡張性を UI が十分活かせていない。

## 総括

- 現状でも「実用可能なデスクトップシミュレーター」として完成度は高い。
- 次の改善優先度は、まず計算精度に直結する 1〜3 を優先し、その後にキャッシュ管理と UI/型ギャップ（4〜5）を揃えるのが合理的。
