import { createRoot } from 'react-dom/client';
import { App } from './app/app';

const reactRoot = document.getElementById('root');
if (!reactRoot) throw new Error('Failed to find the react root');

const root = createRoot(reactRoot);

root.render(<App />);