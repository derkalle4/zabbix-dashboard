import { createSignal, createEffect, onCleanup } from 'solid-js';
import Dashboard from './components/Dashboard';

const App = () => {
    const [setIsDarkMode] = createSignal(false);

    createEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const updateTheme = (matches) => {
            setIsDarkMode(matches);
            document.documentElement.setAttribute('data-bs-theme', matches ? 'dark' : 'light');
        };

        updateTheme(mediaQuery.matches);

        const handleChange = (e) => updateTheme(e.matches);
        mediaQuery.addEventListener('change', handleChange);
        onCleanup(() => mediaQuery.removeEventListener('change', handleChange));
    });

    return (
        <div class="container">
            <Dashboard />
        </div>
    );
};

export default App;