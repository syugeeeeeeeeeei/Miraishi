# その他 履歴

- 件数: `2`

## add_calculation_flow_to_result_dialog
- 日付: 日付記載なし
- 要約: ユーザーが「なぜこの金額になったのか」を追跡できるようにする。
- 主な変更: 対象: src/types/miraishi.d.ts / AnnualSalaryDetail に calculationTrace を追加。
- 検証: 記載なし
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/add_calculation_flow_to_result_dialog/walkthrough.md)

## fix_wsl_font_mojibake
- 日付: 日付記載なし
- 要約: [x] 文字化けの原因切り分け（エンコード/フォント適用）
- 主な変更: ソース文字列のUTF-8不整合は確認されなかった。 / 文字化けの主因は、Chakra の既定フォント設定（Heading など）がシステムフォントを優先し、環境によって日本語表示品質がぶれること。
- 検証: 記載なし
- 原本: [walkthrough](../../archive/legacy_docs_2026Q1/fix_wsl_font_mojibake/walkthrough.md)
