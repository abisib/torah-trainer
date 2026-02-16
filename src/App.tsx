import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home';
import BookView from './pages/BookView';
import Trainer from './components/Trainer';
import { SettingsProvider } from './contexts/SettingsContext';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/book/:bookId",
    element: <BookView />,
  },
  {
    path: "/read/:parashaId",
    element: <Trainer />,
  },
]);

function App() {
  return (
    <SettingsProvider>
      <RouterProvider router={router} />
    </SettingsProvider>
  );
}

export default App;
