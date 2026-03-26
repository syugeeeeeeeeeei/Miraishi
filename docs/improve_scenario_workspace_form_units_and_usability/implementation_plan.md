# 実装計画

1. 金額入力の共通コンポーネント化
- `ScenarioInputForm` に通貨単位付き `YenNumberInput` を追加する。
- 金額関連の `NumberInput` を順次 `YenNumberInput` へ置換する。

2. 扶養・控除カードの UI 変更
- 配偶者の有無を `Switch` から `ButtonGroup`（有 / 無）へ置換する。
- 選択中の状態が明確になるよう `solid/outline` を使い分ける。

3. フォームの可読性・操作性向上
- コントロールサイズを `md` ベースへ引き上げる。
- セクション見出しサイズとラベルフォントサイズを引き上げる。
- 一方で余白・間隔を圧縮し、全画面時に画面内へ収まりやすいバランスを維持する。

4. ScenarioWorkspace ナビゲーション調整
- 前後ナビボタンとページインジケータを適度に拡大する。

5. 検証
- `yarn typecheck`
- `yarn test`
- `yarn build`
