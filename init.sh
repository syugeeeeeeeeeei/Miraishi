#!/bin/bash

# コマンドが失敗した場合、スクリプトを直ちに終了する
set -e

# --- 処理開始 ---
echo "🚀 Creating directory structure inside 'src'..."

# --- src内部のディレクトリを一括作成 ---
# 'src'ディレクトリ自体もなければ作成する
echo "📂 Creating sub-directories..."
mkdir -p \
  src/main \
  src/preload \
  src/renderer/src/assets \
  src/renderer/src/atoms \
  src/renderer/src/components/layout \
  src/renderer/src/components/ui \
  src/renderer/src/constants \
  src/renderer/src/hooks \
  src/renderer/src/schemas \
  src/renderer/src/services \
  src/renderer/src/theme \
  src/renderer/src/types \
  src/renderer/src/utils \
  src/renderer/src/views/DataView/components \
  src/renderer/src/views/GraphView/components

# --- src内部のファイルを一括作成 ---
echo "📄 Creating empty files..."
touch \
  src/main/index.ts \
  src/main/store.ts \
  src/preload/index.ts \
  src/renderer/index.html \
  src/renderer/src/App.tsx \
  src/renderer/src/main.tsx \
  src/renderer/src/atoms/scenarioAtoms.ts \
  src/renderer/src/atoms/uiAtoms.ts \
  src/renderer/src/hooks/useTaxCalculator.ts \
  src/renderer/src/schemas/scenarioSchema.ts \
  src/renderer/src/services/scenarioManager.ts \
  src/renderer/src/theme/index.ts \
  src/renderer/src/types/scenario.d.ts \
  src/renderer/src/types/tax.d.ts \
  src/renderer/src/utils/dateUtils.ts \
  src/renderer/src/views/DataView/index.tsx \
  src/renderer/src/views/DataView/components/InputSection.tsx \
  src/renderer/src/views/DataView/components/CalculationSection.tsx \
  src/renderer/src/views/GraphView/index.tsx \
  src/renderer/src/views/GraphView/components/GraphSection.tsx \
  src/renderer/src/views/GraphView/components/ControlSection.tsx

# --- 完了メッセージ ---
echo ""
echo "✅ 'src' directory structure created successfully!"