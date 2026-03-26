# 修正内容の確認

## 変更点

1. `ScenarioCard` の入力/結果切替UIを撤去し、常時2ペイン表示へ変更。
2. 左ペインに `ScenarioInputForm`、右ペインに `ScenarioResultPanel` を常時配置。
3. `ScenarioWorkspace` に `maxW="1760px"` と中央寄せを追加して、全画面時のスカスカ感を軽減。
4. タイトル入力幅を `maxW="720px"` へ制限。

## 見た目への効果

- 大画面でも情報密度が上がり、余白による間延びが減少。
- 入力しながら常に結果が見えるため、操作の手応えが向上。

## 検証結果

- `typecheck`: 成功
- `test`: 成功
- `build`: 成功
