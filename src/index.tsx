import 'index.css';
import * as serviceWorkerRegistration from 'service-worker-registration';
import { App } from 'components/App/App';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { ErrorBoundary } from 'components/ErrorBoundary/ErrorBoundary';
import { reportWebVitals } from 'utils/report-web-vitals';
import { theme } from 'config/theme';
import React from 'react';
import ReactDOM from 'react-dom/client';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </ThemeProvider>
  </React.StrictMode>,
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
