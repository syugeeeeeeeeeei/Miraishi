# 比較PDF 履歴

- 件数: `7`

## PDF出力失敗修正_dataURL長大化対策
- 日付: 2026-03-27
- 要約: [x] PDF出力失敗原因（ERR_INVALID_URL）を特定
- 主な変更: createPdfBufferFromHtml のHTML読み込み方式を data:text/html;base64,... から loadFile へ変更した。 / Mainプロセスで一時HTMLファイルを temp 配下に作成し、読み込み後に削除する処理を追加した。
- 検証: yarn typecheck 成功 / yarn test --run 成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/PDF出力失敗修正_dataURL長大化対策/walkthrough.md)

## PDF文字化け修正_フォント埋め込みとUTF8強化
- 日付: 2026-03-27
- 要約: [x] PDF文字化けの原因を調査
- 主な変更: PDF出力HTMLのロード方式を charset=utf-8 のURLエンコード方式から base64 方式へ変更した。 / PDFレポートに日本語フォントを埋め込む仕組みを追加した。
- 検証: yarn typecheck 成功 / yarn test --run 成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/PDF文字化け修正_フォント埋め込みとUTF8強化/walkthrough.md)

## シナリオ比較PDFエクスポート仕様策定
- 日付: 2026-03-27
- 要約: [x] 要件整理（複数シナリオ比較・指定年までの成長情報）
- 主な変更: 「複数選択シナリオ比較PDFエクスポート」機能の仕様を確定した。 / UI導線、IPC、データ型、掲載項目、バリデーション、エラー方針を実装可能レベルで定義した。
- 検証: 仕様策定のみ（実装未着手）
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/シナリオ比較PDFエクスポート仕様策定/walkthrough.md)

## シナリオ比較PDFエクスポート実装
- 日付: 2026-03-27
- 要約: [x] PDFエクスポート用のリクエスト/レスポンス型を追加
- 主な変更: 複数シナリオ比較PDFエクスポート機能を実装した。 / Main側に export-scenario-comparison-pdf を追加し、
- 検証: yarn typecheck 成功 / yarn test --run 成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/シナリオ比較PDFエクスポート実装/walkthrough.md)

## A4縦PDFとOptionMenu分離
- 日付: 日付記載なし
- 要約: 比較レポートPDFの出力サイズを A4 縦向きにする。
- 主な変更: PDF出力を A4 縦向きに変更。 / オプションメニュー関連を ControlPanel から分離し、OptionMenu 配下へ集約。
- 検証: 検証成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/A4縦PDFとOptionMenu分離/walkthrough.md)

## 比較PDF_シナリオ中心構成再編
- 日付: 日付記載なし
- 要約: レポート表紙
- 主な変更: src/main/lib/scenarioComparisonPdf.ts / レポート構成を再編し、以下の順序に統一。
- 検証: 検証成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/比較PDF_シナリオ中心構成再編/walkthrough.md)

## 比較PDF_スライド風デザイン改善
- 日付: 日付記載なし
- 要約: 比較表中心で読みにくい
- 主な変更: src/main/lib/scenarioComparisonPdf.ts / レポートHTML生成を全面リファクタ。
- 検証: 検証成功
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/比較PDF_スライド風デザイン改善/walkthrough.md)
