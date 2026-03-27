# 実装計画

## 1. 型とAPIの整備

- `ScenarioComparisonPdfExportRequest/Response` 型を追加する。
- preload経由で Renderer から Main の PDF出力IPCを呼べるようにする。

## 2. Main出力基盤

- 入力バリデーション（シナリオ2件以上、年数範囲、セクション選択）を実装する。
- 対象シナリオを再計算し、比較DTOを構築する。
- 比較DTOから印刷用HTMLを生成する。
- `BrowserWindow.webContents.printToPDF` でPDF化し、保存ダイアログ経由でファイル保存する。

## 3. Renderer導線

- システムラジアルメニューに「比較レポート(PDF)」を追加する。
- 設定ダイアログで対象シナリオ・比較年・平均残業時間・出力セクションを指定可能にする。
- エクスポート結果をトースト表示する。

## 4. 検証

- 型チェックと既存テストを実行し回帰がないことを確認する。
