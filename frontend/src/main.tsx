import React from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from './ErrorBoundary';
import App from './App';
import './styles/index.css';

const root = document.getElementById('root');
if (!root) {
  document.body.innerHTML = '<div style="padding:24px;color:red">Root element #root not found</div>';
} else {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
