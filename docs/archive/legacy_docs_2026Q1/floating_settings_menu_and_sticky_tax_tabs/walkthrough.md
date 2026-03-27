# 修正内容の確認

## 1. 設定メニューのフローティング化
- `ControlPanel` 内部の `VStack` 末尾にあった `SystemRadialMenu` を削除。
- `ControlPanel` のルート直下に `position: fixed` の `Box` を追加し、`SystemRadialMenu` を配置。
- これにより、サイドパネルの開閉幅変更とは無関係に、設定メニューの表示位置が一定になる。

## 2. SystemRadialMenu の依存整理
- `isPanelOpen` / ホバーゾーン関連の props を廃止し、メニュー表示責務に集中。
- 固定配置前提のため、メニュー基準座標（left/bottom）を定数化。
- 展開角度を微調整し、下方向へのはみ出しを抑えた。

## 3. 税金ルールダイアログのタブ改善
- `TabList` に背景色・枠線・角丸・影を付与し、背景同化を防止。
- `Tab` の `_selected` スタイルを明示し、アクティブ状態を判別しやすくした。
- `TabList` を `position: sticky; top: 0; z-index: 2;` とし、ダイアログ本文スクロール時も常に上部表示されるようにした。

## 4. 検証
- `yarn typecheck` で型チェックを実施し、エラーがないことを確認。
