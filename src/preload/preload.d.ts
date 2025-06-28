import { ElectronAPI } from '@electron-toolkit/preload'
import { api } from './index' // index.tsでエクスポートしたapiをインポート

declare global {
  interface Window {
    electron: ElectronAPI
    api: typeof api // apiの型をwindow.apiとして定義
  }
}
