# 仕様書（互換契約 + 税制スキーマ運用版）

## 1. 文書の目的

本書は、Miraishi の「実装方式」ではなく、外部から観測可能な契約を定義する。  
UIや内部構成が変化しても、本契約を満たす限り仕様準拠とする。

## 2. システム構成（論理）

Miraishi は以下3層の責務分離を前提とする。

- ドメイン・実行層（計算、永続化、OS連携）
- ブリッジ層（プリロード経由の安全なIPC窓口）
- 表示・操作層（入力、可視化、状態管理）

### 2.1 層ごとの責務

- ドメイン・実行層
  - シナリオ保存/更新/削除
  - 予測計算
  - 税制スキーマの検証・適用・履歴管理
  - 比較レポートPDF生成
- ブリッジ層
  - 表示層へ公開するAPI契約の固定
  - 特権機能を最小公開
- 表示・操作層
  - シナリオ入力
  - 税制スキーマ編集（YAML）
  - 比較表示とPDF出力

## 3. データ契約

本節は最低限維持されるべき項目を定義する。  
追加項目は許可される（互換性ルールは第13章）。

### 3.1 シナリオ契約（Scenario）

必須コア項目:

- `id`
- `title`
- `initialGrossSalary`（初任給。固定残業代込み月額）
- `initialBasicSalary`（内部算出/保持される初期基本給）
- `annualHolidays`（年間休日数）
- `allowances`
- `overtime`
- `annualBonus`
- `bonus`（`fixed` / `basicSalaryMonths`）
- `probation`
- `salaryGrowthRate`
- `deductions`
- `taxProfile.prefectureCode`
- `taxProfile.industryCode`
- `createdAt` / `updatedAt`

正規化契約:

- `annualHolidays` は `0..365` に丸める。
- `initialGrossSalary` が存在する場合、固定残業時間・年間休日数・固定手当を使って `initialBasicSalary` を導出する。
- `taxProfile` 未指定時は既定値（都道府県/業種）を補完する。

### 3.2 グラフ設定契約（GraphViewSettings）

必須コア項目:

- `predictionPeriod`
- `averageOvertimeHours`
- `displayItem`

### 3.3 予測結果契約（PredictionResult）

`details[]` を返し、各年次は少なくとも以下を持つ。

- `year`
- `grossAnnualIncome`
- `netAnnualIncome`
- `totalDeductions`
- `breakdown.income.*`
- `breakdown.deductions.*`
- `calculationTrace.*`

### 3.4 税制スキーマ契約（TaxSchema）

受理型:

- `TaxSchemaV1 | TaxSchemaV2`

内部実行型:

- 計算は正規化後の `TaxSchemaV2` を `CompiledTaxSchemaV2` にコンパイルして実行する。

`TaxSchemaV2` の必須トップレベル:

- `schemaVersion`（`2.0`）
- `version`
- `effectiveFrom`
- `effectiveTo`
- `rules`
- `formula.steps`
- `uiMeta.labels`
- `uiMeta.descriptions`
- `uiMeta.items`

`rules` の必須領域:

- `incomeTaxRates`
- `reconstructionSpecialIncomeTaxRate`
- `residentTaxRate`
- `socialInsurance.healthInsurance`（`rateMode`, `rate`, `rateByPrefecture`, `maxStandardRemuneration`）
- `socialInsurance.pension`
- `socialInsurance.employmentInsurance.employeeRateByIndustry`
- `deductions.basicByTotalIncome`
- `deductions.spouse`
- `deductions.dependent`

`uiMeta.items` 契約:

- 各項目に `name`, `description` を持つ。
- 任意で `formulaStepIds`（関連計算式ID配列）を持てる。
- 確認画面はこの定義を使って項目説明・現在値・関連計算式を表示する。

## 4. 税制スキーマ更新契約

### 4.1 公開IPC

- `preview-tax-schema`
- `apply-tax-schema`
- `list-tax-schema-history`
- `restore-tax-schema`
- `diff-tax-schema`

互換IPC（エイリアス）:

- `get-tax-schema` / `getTaxSchema`
- `update-tax-schema` / `updateTaxSchema`

### 4.2 検証レポート契約（SchemaValidationReport）

返却要素:

- `isValid`
- `errors`
- `warnings`
- `normalizedSchema`
- `diffSummary`（JSON Pointerベース `added/removed/changed`）

### 4.3 適用ガード契約

- `apply-tax-schema` は検証失敗時に適用しない。
- UIの「変更を適用」は `isValid=true` まで無効化可能であること。

### 4.4 履歴・復元契約

`taxSchemaState` は以下を保持する。

- `activeSnapshotId`
- `snapshots[]`
- `legacyBackups[]`

`snapshot` 必須要素:

- `id`
- `hash`
- `schemaVersion`
- `lawVersion`
- `createdAt`
- `note`
- `schema`

履歴制約:

- 適用時は必ず履歴へ追加する。
- 履歴上限は100件とし、超過時は古い順に削除する。
- 復元時は `activeSnapshotId` を切り替え、以後の計算に即時反映する。

## 5. 計算式DSL契約（文字式）

### 5.1 式形式

- `formula.steps[].expr` は文字式を受理する。
- 互換のためAST形式も受理できるが、正規化時は文字式へ変換する。

### 5.2 固定工程ID

`formula.steps` は以下の工程IDをすべて含む。

- `income.annualBasicSalary`
- `income.annualFixedOvertime`
- `income.annualVariableOvertime`
- `income.annualAllowances`
- `income.annualBonus`
- `income.grossAnnualIncome`
- `insurance.health`
- `insurance.pension`
- `insurance.employment`
- `deductions.basic`
- `deductions.spouse`
- `deductions.dependent`
- `deductions.otherTotal`
- `taxableIncome`
- `taxes.income`
- `taxes.reconstruction`
- `taxes.resident`
- `totals.totalDeductions`
- `totals.netAnnualIncome`
- `projection.nextYearMonthlyBasicSalary`

### 5.3 許可演算

- 二項演算子: `+`, `-`, `*`, `/`
- 関数: `add`, `sub`, `mul`, `div`, `min`, `max`, `round`, `if`, `clamp`, `bracketLookup`, `tableLookup`

### 5.4 コンパイル時拒否

- 未許可関数
- 未定義変数参照
- 危険キー（`__proto__`, `prototype`, `constructor`）
- 重複step ID
- 必須step不足
- 循環依存
- サイズ上限超過（式長、トークン数、深さ、ノード数）

## 6. 計算処理契約

処理順序:

1. 年次ループ
2. 収入側算定（基本給、残業、手当、賞与）
3. 社会保険料算定
4. 所得控除算定
5. 課税所得算定
6. 税額算定（所得税、復興特別所得税、住民税）
7. 手取り算定
8. 翌年基本給投影

ルール:

- 住民税は前年課税所得を基準に計算（1年目は前年度収入入力）。
- 健康保険率は `rateMode` と `taxProfile.prefectureCode` で解決。
- 雇用保険率は `taxProfile.industryCode` で解決。
- 同一入力・同一税制スキーマでは決定的に同一出力を返す。

## 7. 比較レポートPDF契約

### 7.1 入力契約

- `scenarioIds` は2件以上
- `untilYear` は `1..50`
- `averageOvertimeHours` は `0..500`
- `includeSections` は1項目以上 true

### 7.2 出力契約

- 用紙: A4縦（portrait）
- 構成:
  - レポート表紙
  - 各シナリオのサマリー
  - 各シナリオの年度詳細カード（2ページ）
  - 税制スキーマと計算前提（`taxMeta=true`時）

補足（現行）:

- `taxMeta` は独立してON/OFF可能。
- それ以外のサマリー系フラグは同一グループとして扱われる。

## 8. 永続化契約

- `scenarios` と `taxSchemaState` をローカルに保存する。
- 旧 `taxSchema` 保存形式が存在する場合は起動時に読み込み可能であること。
- V1スキーマはV2へ正規化移行し、必要に応じてバックアップ保持する。

## 9. エラー契約

- 保存失敗・計算失敗・適用失敗はエラー情報を返却する。
- 失敗時でもアプリ全体の継続性を優先する。
- 重大な起動必須リソース欠損時は安全停止できること。

## 10. セキュリティ契約

- 表示層はプリロードAPI経由でのみ特権機能へアクセスする。
- 計算式評価で `eval` / `new Function` を使用しない。
- DSLは許可構文のみ解釈し、任意コード実行を許可しない。
- PDF生成時に外部リモート依存へ必須接続しない（ローカル生成可能）。

## 11. 性能契約

- 再計算は入力規模に応じて管理し、体感遅延を抑える。
- 計算結果キャッシュは許可するが、スキーマ変更時は破棄して整合性を優先する。

## 12. テスト契約

最小保証:

- 型整合性検証（typecheck）
- 税制スキーマ検証/DSLコンパイルのユニットテスト
- 計算ロジックのユニットテスト
- 差分計算のユニットテスト

推奨:

- 税制スキーマ編集〜適用〜再計算のUI統合テスト
- PDF出力の回帰テスト（文字化け・ページ構成）

## 13. 互換性・拡張ルール（重要）

- 既存コア契約の削除・意味変更は禁止。
- 変更は「追加」「任意化」「内部最適化」を優先する。
- 税制スキーマ拡張は `TaxSchemaV2` の後方互換を維持する。
- 新機能導入時も、既存シナリオと既存保存データを失わない移行を優先する。
