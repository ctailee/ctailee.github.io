import {Route, Routes} from 'react-router';
import HomePage from './pages/HomePage';
import AboutMePage from './pages/AboutMePage';

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutMePage />} />
        </Routes>
    )
}
