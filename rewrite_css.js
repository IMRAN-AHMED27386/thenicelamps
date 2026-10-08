const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src/app/store.css');
let css = fs.readFileSync(cssPath, 'utf8');

const adminCss = `
/* ── Admin Dashboard Refactor ── */
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #0a0a0a;
  color: #e0e0e0;
  font-family: var(--font-sans);
}

.admin-sidebar {
  width: 260px;
  background: #0a0a0a;
  border-right: 1px solid rgba(255,255,255,0.05);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.admin-logo {
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
}
.admin-logo-text {
  font-family: var(--font-sans);
  font-weight: 700;
  letter-spacing: 0.15em;
  font-size: 0.85rem;
  color: #d4af37;
}
.admin-logo-sub {
  font-family: var(--font-sans);
  font-weight: 600;
  letter-spacing: 0.2em;
  font-size: 0.65rem;
  color: rgba(255,255,255,0.5);
  margin-top: 4px;
}

.admin-nav {
  display: flex;
  flex-direction: column;
  padding: 0 16px;
  gap: 8px;
  flex-grow: 1;
}

.admin-nav-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 12px;
  border: none;
  background: transparent;
  color: rgba(255,255,255,0.6);
  font-family: var(--font-sans);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}
.admin-nav-item:hover {
  color: #fff;
  background: rgba(255,255,255,0.03);
}
.admin-nav-item.active {
  background: linear-gradient(90deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0) 100%);
  color: #d4af37;
  font-weight: 500;
}
.admin-nav-item.active::before {
  content: "";
  position: absolute;
  left: -16px;
  top: 10%;
  height: 80%;
  width: 3px;
  background: #d4af37;
  border-radius: 0 4px 4px 0;
}
.admin-badge {
  background: rgba(212, 175, 55, 0.2);
  color: #d4af37;
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 100px;
  margin-left: auto;
}

.admin-signout {
  margin: 16px;
  color: rgba(255,255,255,0.4);
}
.admin-signout:hover {
  color: rgba(255, 255, 255, 0.8);
}

.admin-main {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.admin-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 40px;
  border-bottom: 1px solid rgba(255,255,255,0.03);
}

.admin-search-wrap {
  display: flex;
  align-items: center;
  background: #151515;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 0 16px;
  gap: 12px;
  color: rgba(255,255,255,0.4);
  width: 400px;
}
.admin-search-wrap.sm {
  width: 200px;
  padding: 0 12px;
}
.admin-search-input {
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  padding: 12px 0;
  font-size: 0.9rem;
  width: 100%;
}
.admin-search-input.sm {
  padding: 8px 0;
  font-size: 0.8rem;
}

.admin-top-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}
.btn-gold {
  background: linear-gradient(90deg, #d4af37, #f3e5ab);
  color: #000;
  border: none;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(212, 175, 55, 0.2);
  transition: all 0.2s;
}
.btn-gold:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.3);
}

.admin-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.5);
}

.admin-content-scroll {
  padding: 40px;
  overflow-y: auto;
  flex-grow: 1;
}

.admin-content-header {
  margin-bottom: 32px;
}
.admin-title {
  font-family: var(--font-serif);
  font-size: 2.5rem;
  color: #fff;
  margin: 0 0 8px 0;
  font-weight: 500;
}
.admin-subtitle {
  color: rgba(255,255,255,0.5);
  font-size: 0.95rem;
}

.admin-summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}
.admin-summary-card {
  background: #121212;
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.02), 0 4px 20px rgba(0,0,0,0.5);
}
.summary-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(212, 175, 55, 0.1);
  color: #d4af37;
  display: flex;
  align-items: center;
  justify-content: center;
}
.summary-val {
  font-size: 1.5rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
}
.summary-lbl {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.5);
}

.admin-products-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  align-items: start;
}
.admin-panel-card {
  background: #121212;
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 16px;
  padding: 24px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.02), 0 4px 20px rgba(0,0,0,0.5);
}
.admin-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.admin-panel-header h3 {
  font-family: var(--font-serif);
  font-size: 1.4rem;
  font-weight: 500;
  margin: 0;
}
.admin-panel-actions {
  display: flex;
  gap: 12px;
}
.admin-input-sm {
  background: #151515;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  padding: 8px 12px;
  color: #fff;
  font-size: 0.8rem;
  outline: none;
}

.admin-pill {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 0.7rem;
  font-weight: 600;
  margin-top: 8px;
}
.admin-pill.success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.2);
}
.admin-pill.danger {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.admin-action-btn {
  background: transparent;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 6px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.admin-action-btn.edit {
  border: 1px solid rgba(212, 175, 55, 0.3);
  color: #d4af37;
}
.admin-action-btn.edit:hover {
  background: rgba(212, 175, 55, 0.1);
}
.admin-action-btn.delete {
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
}
.admin-action-btn.delete:hover {
  background: rgba(239, 68, 68, 0.1);
}
`;

// Append it to store.css
fs.appendFileSync(cssPath, '\n' + adminCss);
console.log('Appended CSS to store.css');
