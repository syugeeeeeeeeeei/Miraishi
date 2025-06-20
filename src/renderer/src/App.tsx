import { AppLayout } from './components/layout/AppLayout';
import { DataView } from './views/DataView';
// ResultViewは後ほど作成します
// import { ResultView } from './views/ResultView';

function App() {
  return (
    <AppLayout>
      <DataView />
      {/* <ResultView /> */}
    </AppLayout>
  );
}

export default App;
