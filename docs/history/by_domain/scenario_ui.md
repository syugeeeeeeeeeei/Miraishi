# シナリオ/UI 履歴

- 件数: `19`

## シナリオ入力_初任給固定残業年間休日対応
- 日付: 2026-03-27
- 要約: [x] シナリオ入力項目に 初任給（固定残業代込み） を追加
- 主な変更: シナリオ入力を「初任給（固定残業代込み）」「固定残業時間」「年間休日数」ベースへ拡張した。 / 入力値から初任基本給を逆算し、固定残業代を算出する正規化処理を追加した。
- 検証: yarn typecheck 成功 / yarn test --run 成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/シナリオ入力_初任給固定残業年間休日対応/walkthrough.md)

## add_bonus_mode_switch_fixed_or_salary_linked
- 日付: 日付記載なし
- 要約: 固定額モード（従来どおり）
- 主な変更: 対象: src/types/miraishi.d.ts / Bonus 型を追加（fixed / basicSalaryMonths）。
- 検証: 検証成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/add_bonus_mode_switch_fixed_or_salary_linked/walkthrough.md)

## bonus_recalculation_on_toggle_and_blur
- 日付: 日付記載なし
- 要約: ボーナスの「固定額 / 基本給連動」切り替えボタンを押した時点で再計算する。
- 主な変更: モード切替ボタン押下時 / 切替先入力欄のフォーカスアウト時
- 検証: yarn typecheck 成功 / yarn test --run src/main/lib/calculator.spec.ts 成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/bonus_recalculation_on_toggle_and_blur/walkthrough.md)

## enable_wheel_based_scenario_switching
- 日付: 日付記載なし
- 要約: 入力要素（input 等）にフォーカス中は切り替えを無効にする。
- 主な変更: 対象: src/renderer/src/components/ScenarioWorkspace/index.tsx / ホイールでシナリオを前後切替する機能を追加。
- 検証: 記載なし
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/enable_wheel_based_scenario_switching/walkthrough.md)

## fix_graphview_chart_font_mojibake
- 日付: 日付記載なし
- 要約: [x] グラフタイトル・凡例の文字化け再発箇所を特定
- 主な変更: グラフタイトルと凡例は Chart.js が canvas 上に描画する。 / DOM側テーマフォントを直しても、Chart.js 側フォント未指定のままだと環境依存フォントへフォールバックし、WSL環境で文字化けが残る。
- 検証: 記載なし
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/fix_graphview_chart_font_mojibake/walkthrough.md)

## fix_salary_growth_recalculation_timing
- 日付: 日付記載なし
- 要約: 給与成長率を高く設定しても、結果表示が微増のままに見える。
- 主な変更: 対象: src/main/lib/calculator.ts / 給与成長率の計算式（currentBasicSalary * (1 + rate / 100)）自体は正しいことを確認。
- 検証: 検証成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/fix_salary_growth_recalculation_timing/walkthrough.md)

## fix_scenario_workspace_card_contrast_and_window_layout
- 日付: 日付記載なし
- 要約: 入力項目カードが背景と同化してカード感が弱い。
- 主な変更: 対象: src/renderer/src/components/ScenarioWorkspace/ScenarioCard.tsx / 変更点:
- 検証: 記載なし
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/fix_scenario_workspace_card_contrast_and_window_layout/walkthrough.md)

## improve_scenario_workspace_form_units_and_usability
- 日付: 日付記載なし
- 要約: 金額入力フォームに通貨単位（円）を表示する。
- 主な変更: 対象: src/renderer/src/components/ScenarioWorkspace/ScenarioInputForm.tsx / YenNumberInput を新規追加し、入力欄右側に「円」を表示するよう変更。
- 検証: 記載なし
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/improve_scenario_workspace_form_units_and_usability/walkthrough.md)

## introduce_desktop_two_pane_scenario_workspace
- 日付: 日付記載なし
- 要約: [x] ScenarioWorkspace のスカスカ要因を確認
- 主な変更: ScenarioCard の入力/結果切替UIを撤去し、常時2ペイン表示へ変更。 / 左ペインに ScenarioInputForm、右ペインに ScenarioResultPanel を常時配置。
- 検証: typecheck 成功 / test 成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/introduce_desktop_two_pane_scenario_workspace/walkthrough.md)

## raise_radial_menu_vertical_position
- 日付: 日付記載なし
- 要約: 一番右のアイコン下端が切れないよう、メニュー全体を少し上へ移動する。
- 主な変更: SystemRadialMenu.tsx / ルートコンテナの高さを 72px -> 84px に変更。
- 検証: 検証成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/raise_radial_menu_vertical_position/walkthrough.md)

## refactor_controlpanel_graphview_header
- 日付: 日付記載なし
- 要約: [x] ControlPanel を責務分離（ヘッダー/一覧/削除ダイアログ）
- 主な変更: ControlPanel / PanelHeader.tsx
- 検証: typecheck 成功 / test 成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/refactor_controlpanel_graphview_header/walkthrough.md)

## remove_fixed_overtime_fixed_amount_mode
- 日付: 日付記載なし
- 要約: 入力の主軸は想定初任給とする。
- 主な変更: 型定義更新 / fixedOvertime.amount を削除。
- 検証: yarn test --run src/main/lib/calculator.spec.ts 成功 / yarn typecheck 成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/remove_fixed_overtime_fixed_amount_mode/walkthrough.md)

## rename_renderer_component_structure
- 日付: 日付記載なし
- 要約: [x] renderer/src/components の現行命名を棚卸し
- 主な変更: DataView 一式を ScenarioWorkspace に移動。 / 子コンポーネントを責務ベースへ改名。
- 検証: 記載なし
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/rename_renderer_component_structure/walkthrough.md)

## tune_wheel_sensitivity_and_scroll_slide_direction
- 日付: 日付記載なし
- 要約: ホイール感度をもう少し高くする。
- 主な変更: 対象: src/renderer/src/components/ScenarioWorkspace/index.tsx / WHEEL_SWITCH_THRESHOLD を 80 から 52 に変更。
- 検証: 記載なし
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/tune_wheel_sensitivity_and_scroll_slide_direction/walkthrough.md)

## シナリオサマリー表示_モダン再デザイン
- 日付: 日付記載なし
- 要約: 初期入力条件の見せ方を強化
- 主な変更: src/main/lib/scenarioComparisonPdf.ts / シナリオサマリーのレイアウトを再設計。
- 検証: 検証成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/シナリオサマリー表示_モダン再デザイン/walkthrough.md)

## 初期入力条件拡大と案内カード削除_グラフ縦長化
- 日付: 日付記載なし
- 要約: 初期入力条件の文字と項目表示を大きくする。
- 主な変更: src/main/lib/scenarioComparisonPdf.ts / シナリオサマリースライドから案内カード（年度詳細の説明カード）を削除。
- 検証: 検証成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/初期入力条件拡大と案内カード削除_グラフ縦長化/walkthrough.md)

## 年度カード_前年比増加額と増加率追加
- 日付: 日付記載なし
- 要約: 額面の増加額と増加率
- 主な変更: src/main/lib/scenarioComparisonPdf.ts / renderAnnualDetailCard を拡張し、前年度比セクションを追加。
- 検証: 検証成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/年度カード_前年比増加額と増加率追加/walkthrough.md)

## 年度給与詳細_カードUI_2ページ化
- 日付: 日付記載なし
- 要約: 年収額面
- 主な変更: src/main/lib/scenarioComparisonPdf.ts / 年度詳細表示をテーブルからカードUIへ全面置換。
- 検証: 検証成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/年度給与詳細_カードUI_2ページ化/walkthrough.md)

## 年次推移ダッシュボード_縦積み大型グラフ化
- 日付: 日付記載なし
- 要約: 年次推移ダッシュボードを、シナリオ縦積みでより大きく表示する。
- 主な変更: src/main/lib/scenarioComparisonPdf.ts / 年次推移グラフに以下を追加。
- 検証: 検証成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/年次推移ダッシュボード_縦積み大型グラフ化/walkthrough.md)
