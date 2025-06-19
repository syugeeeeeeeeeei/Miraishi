// このファイルは、preload/index.tsで公開したAPIの型を
// レンダラープロセス（UI側）のTypeScriptに教えるためのものです。
// これにより、`window.api.saveScenarios` のようなコードで型補完が効くようになります。

import { api } from '../../preload/index'

declare global {
  interface Window {
    api: typeof api
  }
}
