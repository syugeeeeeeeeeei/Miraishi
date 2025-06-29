// src/vite-env.d.ts または src/assets.d.ts
/// <reference types="vite/client" />

// ?url, ?raw, ?worker, ?worker&inline などのVite特有のインポートを扱う
declare module '*.svg?url' {
  const content: string;
  export default content;
}

declare module '*.png?asset' {
  const content: string; // または any, URLなど
  export default content;
}

declare module '*.jpg?asset' {
  const content: string;
  export default content;
}

declare module '*.jpeg?asset' {
  const content: string;
  export default content;
}

declare module '*.gif?asset' {
  const content: string;
  export default content;
}

// 他の一般的な画像形式やアセットタイプも追加できます
declare module '*.ico' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

// ?assetを付けない場合のデフォルトの画像モジュールも定義しておくと安全です
declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.svg' {
  const content: string;
  export default content;
}
