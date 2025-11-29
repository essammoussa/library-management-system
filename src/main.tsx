import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Redux
import { Provider } from 'react-redux';
import { store } from './store';

// React Router
import { BrowserRouter } from 'react-router-dom';

// Context for user role management
import { RoleProvider } from './store/RoleContext';

// Global CSS
import './index.css';

/* -----------------------------------------
   Root Rendering
------------------------------------------ */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>

    <Provider store={store}>{/* Redux Provider: makes the store available to all components */}

      <RoleProvider>{/* RoleProvider: manages user authentication and roles */}

        {/* BrowserRouter: enables React Router routing */}
        <BrowserRouter>
           {/* Main App component */}
           <App />
          
        </BrowserRouter>
      </RoleProvider>
    </Provider>
  </React.StrictMode>
);
