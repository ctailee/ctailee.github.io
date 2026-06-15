import {Route, Routes} from 'react-router';
import Layout from './components/layout';
import HomePage from './pages/HomePage';
import AboutMePage from './pages/AboutMePage';

export default function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutMePage />} />
            </Route>
        </Routes>
    )
}
