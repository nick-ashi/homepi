import { PageCarousel } from "./PageCarousel";
import { NowPlayingPage } from "./pages/NowPlayingPage";
import { WidgetsPage } from "./pages/WidgetsPage";

function App() {
  return <PageCarousel pages={[<NowPlayingPage />, <WidgetsPage />]} />;
}

export default App;
