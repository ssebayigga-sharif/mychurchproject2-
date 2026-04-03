import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { registerSW } from 'virtual:pwa-register';
import { syncManager } from "./db/sync-manager";

// Register service worker for offline support
registerSW({
  onOfflineReady() {
    console.log('App is ready for offline use');
  },
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      window.location.reload();
    }
  },
});

// Initial sync attempt if online
if (navigator.onLine) {
  syncManager.processQueue();
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);


