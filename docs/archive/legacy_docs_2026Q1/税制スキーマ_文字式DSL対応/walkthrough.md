# 修正内容の確認

## 実施日

- 2026-03-27

## 変更サマリー

- 税制スキーマ式を文字式で記述可能にし、内部は従来どおりAST評価を継続。
- 任意コード実行を行わない安全な独自パーサを導入。
- 危険キー拒否・入力上限制限・安全プロパティ参照を追加。
- 既存AST形式データは読み込み時に文字式へ正規化して可読性を改善。

## 主な変更ファイル

- `src/types/miraishi.d.ts`
- `src/shared/taxSchemaDefaults.ts`
- `src/main/lib/taxSchemaEngine.ts`
- `src/main/lib/validators.ts`
- `src/main/index.ts`
- `src/main/lib/taxSchemaEngine.spec.ts`
- `src/main/lib/validators.spec.ts`

## セキュリティ観点の対応

- 未許可関数を拒否（ホワイトリスト方式）
- 危険キー（`__proto__`, `prototype`, `constructor`）を拒否
- `eval/new Function` 不使用
- 式の長さ/ノード数/深さ上限でDoSを緩和

## 実行結果

- `yarn typecheck`: 成功
- `yarn test --run`: 成功（4 files / 22 tests）
