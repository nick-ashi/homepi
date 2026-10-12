import { PageCarousel } from "./PageCarousel";
import { NowPlayingPage } from "./pages/NowPlayingPage";
import { WidgetsPage } from "./pages/WidgetsPage";

function App() {
  return (
    <PageCarousel pages={[<NowPlayingPage key="now-playing" />, <WidgetsPage key="widgets" />]} />
  );
}

export default App;
