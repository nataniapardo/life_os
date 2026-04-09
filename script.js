* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
}

body {
  background-color: #f4f5f7;
  color: #222;
}

.app-container {
  display: flex;
  min-height: 100vh;
}

/* LEFT PANEL */
.customizer-panel {
  width: 35%;
  min-width: 320px;
  background-color: #ffffff;
  padding: 24px;
  border-right: 1px solid #ddd;
}

.customizer-panel h1 {
  font-size: 28px;
  margin-bottom: 8px;
}

.subtitle {
  color: #666;
  margin-bottom: 24px;
}

.control-group {
  margin-bottom: 18px;
}

.control-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
}

.control-group input[type="text"],
.control-group textarea,
.control-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #bbb;
  border-radius: 8px;
  font-size: 14px;
}

.checkbox-group label {
  font-weight: normal;
}

#applyButton {
  width: 100%;
  padding: 12px;
  background-color: #111827;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 12px;
}

#applyButton:hover {
  background-color: #374151;
}

/* RIGHT PANEL */
.preview-panel {
  width: 65%;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.website-preview {
  width: 100%;
  max-width: 850px;
  min-height: 600px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
  padding: 24px;
}

/* THEMES */
.light-theme {
  background-color: #ffffff;
  color: #111827;
}

.dark-theme {
  background-color: #111827;
  color: #f9fafb;
}

.dark-theme .site-header,
.dark-theme .breadcrumbs,
.dark-theme .search-container input,
.dark-theme .hero-section,
.dark-theme .site-footer {
  border-color: #374151;
}

.dark-theme .search-container input {
  background-color: #1f2937;
  color: #f9fafb;
}

/* PREVIEW CONTENT */
.site-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ddd;
}

.favicon-display {
  font-size: 32px;
  width: 50px;
  height: 50px;
  background-color: #f3f4f6;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-text h2 {
  font-size: 28px;
  margin-bottom: 4px;
}

.header-text p {
  color: inherit;
  opacity: 0.8;
}

.breadcrumbs {
  margin-top: 16px;
  font-size: 14px;
  opacity: 0.8;
}

.search-container {
  margin-top: 16px;
}

.search-container input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.hero-section {
  margin-top: 24px;
  padding-top: 16px;
}

.hero-section h3 {
  font-size: 22px;
  margin-bottom: 10px;
}

.hero-section p {
  margin-bottom: 16px;
  opacity: 0.9;
}

.hero-section img {
  width: 100%;
  border-radius: 12px;
  border: 1px solid #ddd;
}

.site-footer {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #ddd;
  font-size: 14px;
  opacity: 0.8;
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .app-container {
    flex-direction: column;
  }

  .customizer-panel,
  .preview-panel {
    width: 100%;
  }

  .preview-panel {
    padding-top: 0;
  }
}
