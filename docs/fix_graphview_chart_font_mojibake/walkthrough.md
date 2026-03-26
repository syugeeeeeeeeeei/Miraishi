# 修正内容の確認

## 原因

- グラフタイトルと凡例は Chart.js が canvas 上に描画する。
- DOM側テーマフォントを直しても、Chart.js 側フォント未指定のままだと環境依存フォントへフォールバックし、WSL環境で文字化けが残る。
- フォント読込完了前に描画されると、初回描画が不正フォントのままになる場合がある。

## 実施修正

1. Chart.js のグローバル既定フォント (`ChartJS.defaults.font.family`) を日本語フォントスタックへ設定。
2. GraphView の chart options で以下に同フォントを明示。
- `plugins.title.font.family`
- `plugins.legend.labels.font.family`
- `scales.x.ticks.font.family`
- `scales.y.ticks.font.family`
3. `document.fonts.ready` 完了まではグラフ描画を待機し、ローディング表示を維持。

## 結果

- グラフタイトルと凡例の日本語表示が環境依存フォントに引っ張られにくくなった。
- `typecheck` / `test` / `build` はすべて成功。
