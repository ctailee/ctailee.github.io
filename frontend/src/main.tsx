import {createRoot} from 'react-dom/client';
import {HashRouter} from 'react-router';
import './index.css';
import App from './App';

const root = createRoot(document.getElementById('root')!);
root.render(
    <HashRouter>
        <App />
    </HashRouter>
)
