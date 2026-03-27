# 実装計画

## 方針
- Main 側は IPC チャンネルを複数名で受けられるようにして、命名揺れによる未登録エラーを回避する。
- Renderer 側は API 未登録時でもローカル保存スキーマで継続利用できるフォールバックを用意し、UX を維持する。

## 実装ステップ
1. `src/main/index.ts` で税金ルールの取得・更新ハンドラを関数化する。
2. 同一ハンドラを `get-tax-schema` / `getTaxSchema`、`update-tax-schema` / `updateTaxSchema` の両方に登録する。
3. `src/renderer/src/components/ControlPanel/index.tsx` にローカル保存キーを追加する。
4. 税金ルールのローカル読み込み/保存ヘルパーを実装する。
5. API呼び出し時に、未登録エラーで legacy チャンネルへ再試行する分岐を追加する。
6. 取得失敗時はローカル保存（なければ内蔵デフォルト）でダイアログを開く。
7. 確定時はローカルにも保存し、更新API未登録時はローカルモードで完了トーストを表示する。
8. `yarn typecheck` で確認する。

## 影響範囲
- `src/main/index.ts`
- `src/renderer/src/components/ControlPanel/index.tsx`
