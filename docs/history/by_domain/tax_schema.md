# 税制スキーマ/税計算 履歴

- 件数: `17`

## メタ付きスキーマ作成と検証前適用禁止
- 日付: 2026-03-27
- 要約: [x] name/description を含む新仕様スキーマファイルを作成
- 主な変更: resources/schema/tax_schema_with_meta.yaml を新規追加した。 / 内容は V2 新仕様（schemaVersion: 2.0）
- 検証: yarn typecheck 成功 / yarn test --run 成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/メタ付きスキーマ作成と検証前適用禁止/walkthrough.md)

## 全ルール項目メタ拡張と新仕様スキーマ更新
- 日付: 2026-03-27
- 要約: [x] uiMeta.items を全ルール項目へ網羅拡張
- 主な変更: 税制スキーマの uiMeta.items を全ルール項目へ拡張した。 / 健康保険・厚生年金・雇用保険・控除の各項目について、個別の name/description と関連計算式IDを付与した。
- 検証: yarn typecheck 成功 / yarn test --run 成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/全ルール項目メタ拡張と新仕様スキーマ更新/walkthrough.md)

## 税制スキーマ_文字式DSL対応
- 日付: 2026-03-27
- 要約: [x] formula.steps[].expr を文字式中心で扱えるよう型を更新
- 主な変更: 税制スキーマ式を文字式で記述可能にし、内部は従来どおりAST評価を継続。 / 任意コード実行を行わない安全な独自パーサを導入。
- 検証: yarn typecheck 成功 / yarn test --run 成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/税制スキーマ_文字式DSL対応/walkthrough.md)

## 税制スキーマ刷新_エディタ中心_DSL履歴対応
- 日付: 2026-03-27
- 要約: [x] TaxSchemaV2 の型・デフォルト・V1移行を追加
- 主な変更: 税制スキーマを V2 中心へ移行し、V1 は移行入口として維持。 / 税率計算を制限DSL（AST）へ寄せ、任意コード実行を排除。
- 検証: yarn typecheck 成功 / yarn test --run 成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/税制スキーマ刷新_エディタ中心_DSL履歴対応/walkthrough.md)

## 税制スキーマ項目メタ情報と確認画面アコーディオン
- 日付: 2026-03-27
- 要約: [x] 税制スキーマに項目メタ情報（name/description）の受け皿を追加
- 主な変更: 税制スキーマに uiMeta.items を追加し、各項目の name / description を持てるようにした。 / 各項目を formulaStepIds で計算ステップと紐づけ可能にした。
- 検証: yarn typecheck 成功 / yarn test --run 成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/税制スキーマ項目メタ情報と確認画面アコーディオン/walkthrough.md)

## 計算式ステップ項目削除と表示文言修正
- 日付: 2026-03-27
- 要約: [x] 確認画面の項目一覧から formula.steps を除外
- 主な変更: 確認画面のアコーディオン項目定義から formula.steps を除外した。 / resources/schema/tax_schema.yaml / resources/schema/tax_schema_with_meta.yaml の uiMeta.items から formula.steps を削除した。
- 検証: yarn typecheck 成功 / yarn test --run 成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/計算式ステップ項目削除と表示文言修正/walkthrough.md)

## 重複スキーマファイル整理
- 日付: 2026-03-27
- 要約: [x] tax_schema.yaml と tax_schema_with_meta.yaml の差分確認
- 主な変更: tax_schema.yaml と tax_schema_with_meta.yaml は差分がなく、内容が完全一致していることを確認した。 / 実際にアプリ起動時に読み込まれているのは src/main/index.ts の tax_schema.yaml のみであることを確認した。
- 検証: 記載なし
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/重複スキーマファイル整理/walkthrough.md)

## add_previous_year_income_input_for_resident_tax
- 日付: 日付記載なし
- 要約: シナリオ入力に「前年度収入（住民税計算用）」を追加する。
- 主な変更: deductions.previousYearIncome を追加（未設定時は0想定）。 / バリデーション
- 検証: yarn test --run src/main/lib/calculator.spec.ts 成功 / yarn typecheck 成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/add_previous_year_income_input_for_resident_tax/walkthrough.md)

## adjust_tax_rule_tab_spacing_and_gray_bg
- 日付: 日付記載なし
- 要約: 税金ルールダイアログのモード切替タブについて、フォームモード時にヘッダーとの間に見える上部の隙間を解消する。
- 主な変更: ModalBody に pt={0} を指定し、モーダルヘッダー直下に発生していた不要な上余白を解消。 / px={6} と pb={6} を明示して、横方向・下方向の余白は維持。
- 検証: 検証記載あり
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/adjust_tax_rule_tab_spacing_and_gray_bg/walkthrough.md)

## fix_formula_mojibake_in_calculation_flow_dialog
- 日付: 日付記載なし
- 要約: Code コンポーネントの等幅フォントが日本語・一部記号に弱く、環境依存で文字化けが発生している可能性。
- 主な変更: 対象: src/renderer/src/components/ScenarioWorkspace/PredictionResultTable.tsx / FormulaLine 内の Code に fontFamily="body" と lineHeight="tall" を追加。
- 検証: 記載なし
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/fix_formula_mojibake_in_calculation_flow_dialog/walkthrough.md)

## fix_radial_menu_clipping_and_tax_schema_handler_fallback
- 日付: 日付記載なし
- 要約: 歯車クリックで展開する円形メニューのアイコンが見切れないようにする。
- 主な変更: SystemRadialMenu.tsx / 半径を縮小し、展開角度を右寄せアークへ変更。
- 検証: 検証成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/fix_radial_menu_clipping_and_tax_schema_handler_fallback/walkthrough.md)

## fix_settings_menu_hover_icon_and_tax_api_fallback
- 日付: 日付記載なし
- 要約: サイドパネルが閉じている状態で設定メニュー（歯車）にホバーしても、サイドパネルが自動で開かないようにする。
- 主な変更: ControlPanel/index.tsx / ホバー開閉ロジックを onMouseMove ベースへ変更。
- 検証: 検証成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/fix_settings_menu_hover_icon_and_tax_api_fallback/walkthrough.md)

## fix_tax_rule_api_compatibility_and_local_fallback
- 日付: 日付記載なし
- 要約: 税金ルールメニュー起動時に以下の互換モード警告が表示される問題を解消する。
- 主な変更: get-tax-schema と update-tax-schema の処理をそれぞれ共通ハンドラ関数へ切り出し。 / それらを以下チャンネル名に重複登録して互換性を確保。
- 検証: 検証成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/fix_tax_rule_api_compatibility_and_local_fallback/walkthrough.md)

## floating_settings_menu_and_sticky_tax_tabs
- 日付: 日付記載なし
- 要約: 設定メニューアイコンがサイドパネルの開閉に影響されて位置ずれするため、サイドパネルから独立したフローティングアイコンに変更する。
- 主な変更: ControlPanel 内部の VStack 末尾にあった SystemRadialMenu を削除。 / ControlPanel のルート直下に position: fixed の Box を追加し、SystemRadialMenu を配置。
- 検証: 検証記載あり
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/floating_settings_menu_and_sticky_tax_tabs/walkthrough.md)

## tax_rule_editor_with_radial_menu
- 日付: 日付記載なし
- 要約: サイドパネル最下部に歯車アイコンを配置。
- 主な変更: Main / get-tax-schema / update-tax-schema IPCを追加。
- 検証: 検証成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/tax_rule_editor_with_radial_menu/walkthrough.md)

## use_symbolic_operators_in_formula_text
- 日付: 日付記載なし
- 要約: かける: ×
- 主な変更: 対象: src/renderer/src/components/ScenarioWorkspace/PredictionResultTable.tsx / 計算フロー表示の式テキストを以下へ置換。
- 検証: 記載なし
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/use_symbolic_operators_in_formula_text/walkthrough.md)

## 税金内訳_色棒グラフ化
- 日付: 日付記載なし
- 要約: 視認性を上げる
- 主な変更: src/main/lib/scenarioComparisonPdf.ts / renderTaxBreakdownCell を更新し、税金内訳を以下の表示へ変更。
- 検証: 検証成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/税金内訳_色棒グラフ化/walkthrough.md)
