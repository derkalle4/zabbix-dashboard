import { createSignal, createEffect, onCleanup } from 'solid-js';
import Dashboard from './components/Dashboard';

const App = () => {
    const [isDarkMode, setIsDarkMode] = createSignal(false);

    createEffect(() => {
        // Check initial preference
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkMode(mediaQuery.matches);

        // Apply Bootstrap's dark mode
        document.documentElement.setAttribute('data-bs-theme', mediaQuery.matches ? 'dark' : 'light');

        // Listen for changes
        const handleChange = (e) => {
            setIsDarkMode(e.matches);
            document.documentElement.setAttribute('data-bs-theme', e.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);

        // Cleanup listener on unmount
        onCleanup(() => mediaQuery.removeEventListener('change', handleChange));
    });

    return (
        <div class="container">
            <Dashboard />
        </div>
    );
};

export default App;