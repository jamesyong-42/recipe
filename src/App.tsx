import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SupabaseProvider } from './contexts/SupabaseContext';
import { HomePage } from './pages/HomePage';
import { SnippetPage } from './pages/SnippetPage';
import './index.css';

function App() {
  return (
    <SupabaseProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/snippet/:id" element={<SnippetPage />} />
        </Routes>
      </BrowserRouter>
    </SupabaseProvider>
  );
}

export default App;
