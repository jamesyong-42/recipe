import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { SnippetPage } from './pages/SnippetPage';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/snippet/:id" element={<SnippetPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
