# YAMLエディター 履歴

- 件数: `14`

## CodeMirror_行高微調整
- 日付: 日付記載なし
- 要約: CodeMirror の行の高さを少し小さくする。
- 主な変更: .cm-scroller の lineHeight を 1.85 から 1.75 に変更。 / これにより行間を少し詰め、表示密度を高めた。
- 検証: yarn typecheck:web 成功 / yarn typecheck:node 成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/CodeMirror_行高微調整/walkthrough.md)

## highlightWhitespace_デフォルト適用
- 日付: 日付記載なし
- 要約: 現在の独自スペース可視化スタイルを一度削除する。
- 主な変更: highlightWhitespace() は維持。 / highlightTrailingWhitespace() は削除。
- 検証: yarn typecheck:web 成功 / yarn typecheck:node 成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/highlightWhitespace_デフォルト適用/walkthrough.md)

## yamlエディター_スペース間隔調整
- 日付: 日付記載なし
- 要約: YAMLエディターで表示しているスペース可視化ドットの間隔が狭すぎるため、間隔を広げる。
- 主な変更: .cm-highlightSpace の backgroundSize を 1ch から 1.45ch に変更。 / これによりスペース可視化ドットの繰り返し間隔を広げ、詰まり感を緩和した。
- 検証: yarn typecheck:web 成功 / yarn typecheck:node 成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/yamlエディター_スペース間隔調整/walkthrough.md)

## yamlエディター_モダンUI化
- 日付: 日付記載なし
- 要約: YAML エディターを、よりモダンで見た目と操作感の良い UI に改善する。
- 主な変更: YAML エディターをカード化し、角丸・境界線・シャドウでモダンな見た目に変更。 / 上部にツールバーを追加し、編集状態を一目で確認できる UI にした。
- 検証: yarn typecheck:web 成功 / yarn typecheck:node 成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/yamlエディター_モダンUI化/walkthrough.md)

## yamlエディター_モダン見た目再調整
- 日付: 日付記載なし
- 要約: YAML エディターを「機能追加」ではなく「モダンな見た目・デザイン」重視で再調整する。
- 主な変更: YAMLエディター周辺UIを、機能説明中心から質感中心のデザインへ変更。 / バッジの多用をやめ、ヘッダー情報を最小限に整理。
- 検証: yarn typecheck:web 成功 / yarn typecheck:node 成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/yamlエディター_モダン見た目再調整/walkthrough.md)

## yamlエディター_可読性改善
- 日付: 日付記載なし
- 要約: 税制ルールの YAML エディターで、インデントとブロック構造が見づらい問題を改善する。
- 主な変更: YAML Textarea のフォントを日本語フォールバック付き等幅スタックへ変更。 / fontSize / lineHeight / letterSpacing を調整して可読性を向上。
- 検証: yarn typecheck:web 成功 / yarn typecheck:node 成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/yamlエディター_可読性改善/walkthrough.md)

## yamlエディター_文字幅と文字サイズ拡大
- 日付: 日付記載なし
- 要約: YAML エディターの文字幅と文字サイズを、現状より大きくして読みやすくする。
- 主な変更: YAML エディター全体のフォントサイズを 15px に変更。 / .cm-content に letterSpacing: 0.02em を追加して字間を拡大。
- 検証: yarn typecheck:web 成功 / yarn typecheck:node 成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/yamlエディター_文字幅と文字サイズ拡大/walkthrough.md)

## yamlエディター_空白可視化と文字化け再修正
- 日付: 日付記載なし
- 要約: WSL GUI 環境で YAML エディターの日本語等幅フォントが文字化けする問題を修正する。
- 主な変更: YAML エディターのフォントを、var(--chakra-fonts-body) 優先のスタックへ変更。 / 日本語表示に強い UI フォント群を優先し、WSL GUI での文字化け発生を抑える構成にした。
- 検証: yarn typecheck:web 成功 / yarn typecheck:node 成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/yamlエディター_空白可視化と文字化け再修正/walkthrough.md)

## yamlエディター_空白表示スタイル改善
- 日付: 日付記載なし
- 要約: YAML エディターで、空白スペース・タブの横幅が小さく見える問題を改善する。
- 主な変更: YAML エディターのフォントスタックを ui-monospace 優先に変更。 / ASCII のインデント幅が揃いやすい構成にして、空白幅の違和感を軽減。
- 検証: yarn typecheck:web 成功 / yarn typecheck:node 成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/yamlエディター_空白表示スタイル改善/walkthrough.md)

## yamlエディター_見た目微調整_フォントと空白ドット
- 日付: 日付記載なし
- 要約: Apple風の赤・黄・緑マークを削除する。
- 主な変更: YAMLエディターヘッダーの赤・黄・緑マークを削除。 / ヘッダーは YAML EDITOR と構文ステータスのみのミニマル構成にした。
- 検証: yarn typecheck:web 成功 / yarn typecheck:node 成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/yamlエディター_見た目微調整_フォントと空白ドット/walkthrough.md)

## yamlエディター文字化け修正
- 日付: 日付記載なし
- 要約: 税制ルール設定の YAML エディターで日本語が文字化けする問題を修正する。
- 主な変更: TaxRuleDialog のYAML Textarea の fontFamily を mono から body へ変更。 / 日本語フォントを含むアプリ標準フォントスタックを使うことで、文字化けを抑止。
- 検証: yarn typecheck:web 成功 / yarn typecheck:node 成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/yamlエディター文字化け修正/walkthrough.md)

## yamlリッチエディター導入
- 日付: 日付記載なし
- 要約: YAMLエディターの文字化け再発、見づらいインデント表示、ブラウザ赤波線の問題を解消する。
- 主な変更: YAML編集UIを Textarea から CodeMirror 6 へ変更。 / 行番号、折りたたみガター、アクティブ行ハイライト、括弧対応などを有効化。
- 検証: yarn typecheck:web 成功 / yarn typecheck:node 成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/yamlリッチエディター導入/walkthrough.md)

## 税制ルール_スキーマ_yaml対応
- 日付: 日付記載なし
- 要約: 税制ルール定義ファイルを JSON ではなく YAML で管理できるようにする。
- 主な変更: resources/schema/tax_schema.yaml を新規追加。 / 所得税率テーブルや社会保険設定を YAML へ移植。
- 検証: 検証記載あり
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/税制ルール_スキーマ_yaml対応/walkthrough.md)

## 税制ルール設定_yaml編集対応
- 日付: 日付記載なし
- 要約: アプリ内の税制ルール設定メニューを JSON 編集から YAML 編集へ変更する。
- 主な変更: TaxRuleDialog のテキストパースを JSON.parse から parseDocument（YAML）へ変更。 / YAML構文エラー時は先頭エラー内容をメッセージとして表示。
- 検証: 検証成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/税制ルール設定_yaml編集対応/walkthrough.md)
