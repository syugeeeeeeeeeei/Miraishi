# 実装計画

## 方針
- 税制ルールの実体ファイルを `tax_schema.yaml` に移行する。
- Main プロセスの読み込み処理を YAML パース対応に変更する。
- 既存利用者への影響を抑えるため、旧 JSON パスもフォールバックとして読めるようにする。

## 実装ステップ
1. `resources/schema/tax_schema.yaml` を追加し、既存 JSON 内容を移植する。
2. `src/main/index.ts` に YAML パーサーを導入し、読み込み処理を共通関数化する。
3. `tax_schema.yaml` を優先して読み込み、存在しない場合のみ `tax_schema.json` を読むフォールバックを実装する。
4. `README.md` の税制ルール参照パスを YAML に更新する。
5. `yarn typecheck:node` で型検証する。

## 影響範囲
- `src/main/index.ts`
- `resources/schema/tax_schema.yaml`
- `resources/schema/tax_schema.json`（削除）
- `README.md`
- `package.json`
- `yarn.lock`
