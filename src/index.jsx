import 'bootstrap/dist/css/bootstrap.min.css';
import { render } from 'solid-js/web';
import App from './App';
import { APP_CONFIG } from './config.jsx';

if (APP_CONFIG && APP_CONFIG.pageTitle) {
    document.title = APP_CONFIG.pageTitle;
}

const rootElement = document.getElementById('app');
render(() => <App />, rootElement);