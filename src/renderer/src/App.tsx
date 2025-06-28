import { AppLayout } from './components/layout/AppLayout'
import { DataView } from './views/DataView'
import React from 'react'
// ResultViewは後ほど作成します
// import { ResultView } from './views/ResultView';

function App(): React.JSX.Element {
  return (
    <AppLayout>
      <DataView />
      {/* <ResultView /> */}
    </AppLayout>
  )
}

export default App
