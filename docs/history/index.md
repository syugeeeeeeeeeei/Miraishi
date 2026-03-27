# 修正履歴インデックス

- 集約件数: `64`

| No | 日付 | カテゴリ | トピック | 要約 | 検証 | 原本 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 2026-03-27 | 比較PDF | PDF出力失敗修正_dataURL長大化対策 | [x] PDF出力失敗原因（ERR_INVALID_URL）を特定 | yarn typecheck 成功 / yarn test --run 成功 | [link](../archive/legacy_docs_2026Q1/PDF出力失敗修正_dataURL長大化対策/walkthrough.md) |
| 2 | 2026-03-27 | 比較PDF | PDF文字化け修正_フォント埋め込みとUTF8強化 | [x] PDF文字化けの原因を調査 | yarn typecheck 成功 / yarn test --run 成功 | [link](../archive/legacy_docs_2026Q1/PDF文字化け修正_フォント埋め込みとUTF8強化/walkthrough.md) |
| 3 | 2026-03-27 | シナリオ/UI | シナリオ入力_初任給固定残業年間休日対応 | [x] シナリオ入力項目に 初任給（固定残業代込み） を追加 | yarn typecheck 成功 / yarn test --run 成功 | [link](../archive/legacy_docs_2026Q1/シナリオ入力_初任給固定残業年間休日対応/walkthrough.md) |
| 4 | 2026-03-27 | 比較PDF | シナリオ比較PDFエクスポート仕様策定 | [x] 要件整理（複数シナリオ比較・指定年までの成長情報） | 仕様策定のみ（実装未着手） | [link](../archive/legacy_docs_2026Q1/シナリオ比較PDFエクスポート仕様策定/walkthrough.md) |
| 5 | 2026-03-27 | 比較PDF | シナリオ比較PDFエクスポート実装 | [x] PDFエクスポート用のリクエスト/レスポンス型を追加 | yarn typecheck 成功 / yarn test --run 成功 | [link](../archive/legacy_docs_2026Q1/シナリオ比較PDFエクスポート実装/walkthrough.md) |
| 6 | 2026-03-27 | ドキュメント運用 | ドキュメント圧縮整理方針 | docs/readmes 以外に蓄積された修正ドキュメント群（各トピックの task.md / implementation_plan.md / walkthrough.md）を圧縮し、保守しやすく整理する方針を策定する。 | 検証未実施 | [link](../archive/legacy_docs_2026Q1/ドキュメント圧縮整理方針/walkthrough.md) |
| 7 | 2026-03-27 | 税制スキーマ/税計算 | メタ付きスキーマ作成と検証前適用禁止 | [x] name/description を含む新仕様スキーマファイルを作成 | yarn typecheck 成功 / yarn test --run 成功 | [link](../archive/legacy_docs_2026Q1/メタ付きスキーマ作成と検証前適用禁止/walkthrough.md) |
| 8 | 2026-03-27 | ドキュメント運用 | リポジトリ内容分析 | [x] リポジトリ全体の構成（README・docs・src・設定ファイル）を確認する | yarn typecheck 成功 / yarn test run 成功 | [link](../archive/legacy_docs_2026Q1/リポジトリ内容分析/walkthrough.md) |
| 9 | 2026-03-27 | 税制スキーマ/税計算 | 全ルール項目メタ拡張と新仕様スキーマ更新 | [x] uiMeta.items を全ルール項目へ網羅拡張 | yarn typecheck 成功 / yarn test --run 成功 | [link](../archive/legacy_docs_2026Q1/全ルール項目メタ拡張と新仕様スキーマ更新/walkthrough.md) |
| 10 | 2026-03-27 | 税制スキーマ/税計算 | 税制スキーマ_文字式DSL対応 | [x] formula.steps[].expr を文字式中心で扱えるよう型を更新 | yarn typecheck 成功 / yarn test --run 成功 | [link](../archive/legacy_docs_2026Q1/税制スキーマ_文字式DSL対応/walkthrough.md) |
| 11 | 2026-03-27 | 税制スキーマ/税計算 | 税制スキーマ刷新_エディタ中心_DSL履歴対応 | [x] TaxSchemaV2 の型・デフォルト・V1移行を追加 | yarn typecheck 成功 / yarn test --run 成功 | [link](../archive/legacy_docs_2026Q1/税制スキーマ刷新_エディタ中心_DSL履歴対応/walkthrough.md) |
| 12 | 2026-03-27 | 税制スキーマ/税計算 | 税制スキーマ項目メタ情報と確認画面アコーディオン | [x] 税制スキーマに項目メタ情報（name/description）の受け皿を追加 | yarn typecheck 成功 / yarn test --run 成功 | [link](../archive/legacy_docs_2026Q1/税制スキーマ項目メタ情報と確認画面アコーディオン/walkthrough.md) |
| 13 | 2026-03-27 | 税制スキーマ/税計算 | 計算式ステップ項目削除と表示文言修正 | [x] 確認画面の項目一覧から formula.steps を除外 | yarn typecheck 成功 / yarn test --run 成功 | [link](../archive/legacy_docs_2026Q1/計算式ステップ項目削除と表示文言修正/walkthrough.md) |
| 14 | 2026-03-27 | ドキュメント運用 | 追加機能棚卸しとドキュメント更新 | これまで追加した主要機能を再棚卸しする。 | 検証記載あり | [link](../archive/legacy_docs_2026Q1/追加機能棚卸しとドキュメント更新/walkthrough.md) |
| 15 | 2026-03-27 | 税制スキーマ/税計算 | 重複スキーマファイル整理 | [x] tax_schema.yaml と tax_schema_with_meta.yaml の差分確認 | 記載なし | [link](../archive/legacy_docs_2026Q1/重複スキーマファイル整理/walkthrough.md) |
| 16 | 日付記載なし | 比較PDF | A4縦PDFとOptionMenu分離 | 比較レポートPDFの出力サイズを A4 縦向きにする。 | 検証成功 | [link](../archive/legacy_docs_2026Q1/A4縦PDFとOptionMenu分離/walkthrough.md) |
| 17 | 日付記載なし | YAMLエディター | CodeMirror_行高微調整 | CodeMirror の行の高さを少し小さくする。 | yarn typecheck:web 成功 / yarn typecheck:node 成功 | [link](../archive/legacy_docs_2026Q1/CodeMirror_行高微調整/walkthrough.md) |
| 18 | 日付記載なし | シナリオ/UI | add_bonus_mode_switch_fixed_or_salary_linked | 固定額モード（従来どおり） | 検証成功 | [link](../archive/legacy_docs_2026Q1/add_bonus_mode_switch_fixed_or_salary_linked/walkthrough.md) |
| 19 | 日付記載なし | その他 | add_calculation_flow_to_result_dialog | ユーザーが「なぜこの金額になったのか」を追跡できるようにする。 | 記載なし | [link](../archive/legacy_docs_2026Q1/add_calculation_flow_to_result_dialog/walkthrough.md) |
| 20 | 日付記載なし | 税制スキーマ/税計算 | add_previous_year_income_input_for_resident_tax | シナリオ入力に「前年度収入（住民税計算用）」を追加する。 | yarn test --run src/main/lib/calculator.spec.ts 成功 / yarn typecheck 成功 | [link](../archive/legacy_docs_2026Q1/add_previous_year_income_input_for_resident_tax/walkthrough.md) |
| 21 | 日付記載なし | 税制スキーマ/税計算 | adjust_tax_rule_tab_spacing_and_gray_bg | 税金ルールダイアログのモード切替タブについて、フォームモード時にヘッダーとの間に見える上部の隙間を解消する。 | 検証記載あり | [link](../archive/legacy_docs_2026Q1/adjust_tax_rule_tab_spacing_and_gray_bg/walkthrough.md) |
| 22 | 日付記載なし | シナリオ/UI | bonus_recalculation_on_toggle_and_blur | ボーナスの「固定額 / 基本給連動」切り替えボタンを押した時点で再計算する。 | yarn typecheck 成功 / yarn test --run src/main/lib/calculator.spec.ts 成功 | [link](../archive/legacy_docs_2026Q1/bonus_recalculation_on_toggle_and_blur/walkthrough.md) |
| 23 | 日付記載なし | ドキュメント運用 | documentation_migration_to_docs_readmes | [x] 旧 documents の構成と参照箇所を確認 | 記載なし | [link](../archive/legacy_docs_2026Q1/documentation_migration_to_docs_readmes/walkthrough.md) |
| 24 | 日付記載なし | シナリオ/UI | enable_wheel_based_scenario_switching | 入力要素（input 等）にフォーカス中は切り替えを無効にする。 | 記載なし | [link](../archive/legacy_docs_2026Q1/enable_wheel_based_scenario_switching/walkthrough.md) |
| 25 | 日付記載なし | 税制スキーマ/税計算 | fix_formula_mojibake_in_calculation_flow_dialog | Code コンポーネントの等幅フォントが日本語・一部記号に弱く、環境依存で文字化けが発生している可能性。 | 記載なし | [link](../archive/legacy_docs_2026Q1/fix_formula_mojibake_in_calculation_flow_dialog/walkthrough.md) |
| 26 | 日付記載なし | シナリオ/UI | fix_graphview_chart_font_mojibake | [x] グラフタイトル・凡例の文字化け再発箇所を特定 | 記載なし | [link](../archive/legacy_docs_2026Q1/fix_graphview_chart_font_mojibake/walkthrough.md) |
| 27 | 日付記載なし | 税制スキーマ/税計算 | fix_radial_menu_clipping_and_tax_schema_handler_fallback | 歯車クリックで展開する円形メニューのアイコンが見切れないようにする。 | 検証成功 | [link](../archive/legacy_docs_2026Q1/fix_radial_menu_clipping_and_tax_schema_handler_fallback/walkthrough.md) |
| 28 | 日付記載なし | シナリオ/UI | fix_salary_growth_recalculation_timing | 給与成長率を高く設定しても、結果表示が微増のままに見える。 | 検証成功 | [link](../archive/legacy_docs_2026Q1/fix_salary_growth_recalculation_timing/walkthrough.md) |
| 29 | 日付記載なし | シナリオ/UI | fix_scenario_workspace_card_contrast_and_window_layout | 入力項目カードが背景と同化してカード感が弱い。 | 記載なし | [link](../archive/legacy_docs_2026Q1/fix_scenario_workspace_card_contrast_and_window_layout/walkthrough.md) |
| 30 | 日付記載なし | 税制スキーマ/税計算 | fix_settings_menu_hover_icon_and_tax_api_fallback | サイドパネルが閉じている状態で設定メニュー（歯車）にホバーしても、サイドパネルが自動で開かないようにする。 | 検証成功 | [link](../archive/legacy_docs_2026Q1/fix_settings_menu_hover_icon_and_tax_api_fallback/walkthrough.md) |
| 31 | 日付記載なし | 税制スキーマ/税計算 | fix_tax_rule_api_compatibility_and_local_fallback | 税金ルールメニュー起動時に以下の互換モード警告が表示される問題を解消する。 | 検証成功 | [link](../archive/legacy_docs_2026Q1/fix_tax_rule_api_compatibility_and_local_fallback/walkthrough.md) |
| 32 | 日付記載なし | その他 | fix_wsl_font_mojibake | [x] 文字化けの原因切り分け（エンコード/フォント適用） | 記載なし | [link](../archive/legacy_docs_2026Q1/fix_wsl_font_mojibake/walkthrough.md) |
| 33 | 日付記載なし | 税制スキーマ/税計算 | floating_settings_menu_and_sticky_tax_tabs | 設定メニューアイコンがサイドパネルの開閉に影響されて位置ずれするため、サイドパネルから独立したフローティングアイコンに変更する。 | 検証記載あり | [link](../archive/legacy_docs_2026Q1/floating_settings_menu_and_sticky_tax_tabs/walkthrough.md) |
| 34 | 日付記載なし | YAMLエディター | highlightWhitespace_デフォルト適用 | 現在の独自スペース可視化スタイルを一度削除する。 | yarn typecheck:web 成功 / yarn typecheck:node 成功 | [link](../archive/legacy_docs_2026Q1/highlightWhitespace_デフォルト適用/walkthrough.md) |
| 35 | 日付記載なし | シナリオ/UI | improve_scenario_workspace_form_units_and_usability | 金額入力フォームに通貨単位（円）を表示する。 | 記載なし | [link](../archive/legacy_docs_2026Q1/improve_scenario_workspace_form_units_and_usability/walkthrough.md) |
| 36 | 日付記載なし | シナリオ/UI | introduce_desktop_two_pane_scenario_workspace | [x] ScenarioWorkspace のスカスカ要因を確認 | typecheck 成功 / test 成功 | [link](../archive/legacy_docs_2026Q1/introduce_desktop_two_pane_scenario_workspace/walkthrough.md) |
| 37 | 日付記載なし | シナリオ/UI | raise_radial_menu_vertical_position | 一番右のアイコン下端が切れないよう、メニュー全体を少し上へ移動する。 | 検証成功 | [link](../archive/legacy_docs_2026Q1/raise_radial_menu_vertical_position/walkthrough.md) |
| 38 | 日付記載なし | シナリオ/UI | refactor_controlpanel_graphview_header | [x] ControlPanel を責務分離（ヘッダー/一覧/削除ダイアログ） | typecheck 成功 / test 成功 | [link](../archive/legacy_docs_2026Q1/refactor_controlpanel_graphview_header/walkthrough.md) |
| 39 | 日付記載なし | シナリオ/UI | remove_fixed_overtime_fixed_amount_mode | 入力の主軸は想定初任給とする。 | yarn test --run src/main/lib/calculator.spec.ts 成功 / yarn typecheck 成功 | [link](../archive/legacy_docs_2026Q1/remove_fixed_overtime_fixed_amount_mode/walkthrough.md) |
| 40 | 日付記載なし | シナリオ/UI | rename_renderer_component_structure | [x] renderer/src/components の現行命名を棚卸し | 記載なし | [link](../archive/legacy_docs_2026Q1/rename_renderer_component_structure/walkthrough.md) |
| 41 | 日付記載なし | ドキュメント運用 | repository_analysis_architecture_review | [x] .env にアクセスせず、リポジトリ構成を把握する | yarn typecheck 成功 / yarn test 成功 | [link](../archive/legacy_docs_2026Q1/repository_analysis_architecture_review/walkthrough.md) |
| 42 | 日付記載なし | 税制スキーマ/税計算 | tax_rule_editor_with_radial_menu | サイドパネル最下部に歯車アイコンを配置。 | 検証成功 | [link](../archive/legacy_docs_2026Q1/tax_rule_editor_with_radial_menu/walkthrough.md) |
| 43 | 日付記載なし | シナリオ/UI | tune_wheel_sensitivity_and_scroll_slide_direction | ホイール感度をもう少し高くする。 | 記載なし | [link](../archive/legacy_docs_2026Q1/tune_wheel_sensitivity_and_scroll_slide_direction/walkthrough.md) |
| 44 | 日付記載なし | 税制スキーマ/税計算 | use_symbolic_operators_in_formula_text | かける: × | 記載なし | [link](../archive/legacy_docs_2026Q1/use_symbolic_operators_in_formula_text/walkthrough.md) |
| 45 | 日付記載なし | YAMLエディター | yamlエディター_スペース間隔調整 | YAMLエディターで表示しているスペース可視化ドットの間隔が狭すぎるため、間隔を広げる。 | yarn typecheck:web 成功 / yarn typecheck:node 成功 | [link](../archive/legacy_docs_2026Q1/yamlエディター_スペース間隔調整/walkthrough.md) |
| 46 | 日付記載なし | YAMLエディター | yamlエディター_モダンUI化 | YAML エディターを、よりモダンで見た目と操作感の良い UI に改善する。 | yarn typecheck:web 成功 / yarn typecheck:node 成功 | [link](../archive/legacy_docs_2026Q1/yamlエディター_モダンUI化/walkthrough.md) |
| 47 | 日付記載なし | YAMLエディター | yamlエディター_モダン見た目再調整 | YAML エディターを「機能追加」ではなく「モダンな見た目・デザイン」重視で再調整する。 | yarn typecheck:web 成功 / yarn typecheck:node 成功 | [link](../archive/legacy_docs_2026Q1/yamlエディター_モダン見た目再調整/walkthrough.md) |
| 48 | 日付記載なし | YAMLエディター | yamlエディター_可読性改善 | 税制ルールの YAML エディターで、インデントとブロック構造が見づらい問題を改善する。 | yarn typecheck:web 成功 / yarn typecheck:node 成功 | [link](../archive/legacy_docs_2026Q1/yamlエディター_可読性改善/walkthrough.md) |
| 49 | 日付記載なし | YAMLエディター | yamlエディター_文字幅と文字サイズ拡大 | YAML エディターの文字幅と文字サイズを、現状より大きくして読みやすくする。 | yarn typecheck:web 成功 / yarn typecheck:node 成功 | [link](../archive/legacy_docs_2026Q1/yamlエディター_文字幅と文字サイズ拡大/walkthrough.md) |
| 50 | 日付記載なし | YAMLエディター | yamlエディター_空白可視化と文字化け再修正 | WSL GUI 環境で YAML エディターの日本語等幅フォントが文字化けする問題を修正する。 | yarn typecheck:web 成功 / yarn typecheck:node 成功 | [link](../archive/legacy_docs_2026Q1/yamlエディター_空白可視化と文字化け再修正/walkthrough.md) |
| 51 | 日付記載なし | YAMLエディター | yamlエディター_空白表示スタイル改善 | YAML エディターで、空白スペース・タブの横幅が小さく見える問題を改善する。 | yarn typecheck:web 成功 / yarn typecheck:node 成功 | [link](../archive/legacy_docs_2026Q1/yamlエディター_空白表示スタイル改善/walkthrough.md) |
| 52 | 日付記載なし | YAMLエディター | yamlエディター_見た目微調整_フォントと空白ドット | Apple風の赤・黄・緑マークを削除する。 | yarn typecheck:web 成功 / yarn typecheck:node 成功 | [link](../archive/legacy_docs_2026Q1/yamlエディター_見た目微調整_フォントと空白ドット/walkthrough.md) |
| 53 | 日付記載なし | YAMLエディター | yamlエディター文字化け修正 | 税制ルール設定の YAML エディターで日本語が文字化けする問題を修正する。 | yarn typecheck:web 成功 / yarn typecheck:node 成功 | [link](../archive/legacy_docs_2026Q1/yamlエディター文字化け修正/walkthrough.md) |
| 54 | 日付記載なし | YAMLエディター | yamlリッチエディター導入 | YAMLエディターの文字化け再発、見づらいインデント表示、ブラウザ赤波線の問題を解消する。 | yarn typecheck:web 成功 / yarn typecheck:node 成功 | [link](../archive/legacy_docs_2026Q1/yamlリッチエディター導入/walkthrough.md) |
| 55 | 日付記載なし | シナリオ/UI | シナリオサマリー表示_モダン再デザイン | 初期入力条件の見せ方を強化 | 検証成功 | [link](../archive/legacy_docs_2026Q1/シナリオサマリー表示_モダン再デザイン/walkthrough.md) |
| 56 | 日付記載なし | シナリオ/UI | 初期入力条件拡大と案内カード削除_グラフ縦長化 | 初期入力条件の文字と項目表示を大きくする。 | 検証成功 | [link](../archive/legacy_docs_2026Q1/初期入力条件拡大と案内カード削除_グラフ縦長化/walkthrough.md) |
| 57 | 日付記載なし | シナリオ/UI | 年度カード_前年比増加額と増加率追加 | 額面の増加額と増加率 | 検証成功 | [link](../archive/legacy_docs_2026Q1/年度カード_前年比増加額と増加率追加/walkthrough.md) |
| 58 | 日付記載なし | シナリオ/UI | 年度給与詳細_カードUI_2ページ化 | 年収額面 | 検証成功 | [link](../archive/legacy_docs_2026Q1/年度給与詳細_カードUI_2ページ化/walkthrough.md) |
| 59 | 日付記載なし | シナリオ/UI | 年次推移ダッシュボード_縦積み大型グラフ化 | 年次推移ダッシュボードを、シナリオ縦積みでより大きく表示する。 | 検証成功 | [link](../archive/legacy_docs_2026Q1/年次推移ダッシュボード_縦積み大型グラフ化/walkthrough.md) |
| 60 | 日付記載なし | 比較PDF | 比較PDF_シナリオ中心構成再編 | レポート表紙 | 検証成功 | [link](../archive/legacy_docs_2026Q1/比較PDF_シナリオ中心構成再編/walkthrough.md) |
| 61 | 日付記載なし | 比較PDF | 比較PDF_スライド風デザイン改善 | 比較表中心で読みにくい | 検証成功 | [link](../archive/legacy_docs_2026Q1/比較PDF_スライド風デザイン改善/walkthrough.md) |
| 62 | 日付記載なし | YAMLエディター | 税制ルール_スキーマ_yaml対応 | 税制ルール定義ファイルを JSON ではなく YAML で管理できるようにする。 | 検証記載あり | [link](../archive/legacy_docs_2026Q1/税制ルール_スキーマ_yaml対応/walkthrough.md) |
| 63 | 日付記載なし | YAMLエディター | 税制ルール設定_yaml編集対応 | アプリ内の税制ルール設定メニューを JSON 編集から YAML 編集へ変更する。 | 検証成功 | [link](../archive/legacy_docs_2026Q1/税制ルール設定_yaml編集対応/walkthrough.md) |
| 64 | 日付記載なし | 税制スキーマ/税計算 | 税金内訳_色棒グラフ化 | 視認性を上げる | 検証成功 | [link](../archive/legacy_docs_2026Q1/税金内訳_色棒グラフ化/walkthrough.md) |
