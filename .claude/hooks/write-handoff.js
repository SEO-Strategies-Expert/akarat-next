#!/usr/bin/env node
// OPTIONAL Claude Code "Stop" hook — writes a handoff to the shared bus automatically.
// Cross-platform (Node). Enable only after you've reviewed it (see INSTALL.md).
// It does NOT block stopping and does NOT auto-loop — it only writes files.
const fs = require('fs');
const path = require('path');

// EDIT if your bus path differs (forward slashes are fine on Windows):
const BUS = 'E:/شركة وصال تك/الشركات/akaratistanbul-auto/ملفات شهر يونيو 2026/akarat-review-loop/loop';

let raw = '';
process.stdin.on('data', d => raw += d);
process.stdin.on('end', () => {
  let input = {};
  try { input = JSON.parse(raw || '{}'); } catch (_) {}
  const msg = input.last_assistant_message || '';
  const now = new Date().toISOString();

  // Heuristic: pull a deployment URL out of the last message if present.
  const m = msg.match(/https?:\/\/[^\s)"']*vercel\.app[^\s)"']*/i);
  try {
    if (m) fs.writeFileSync(path.join(BUS, 'deploy-url.txt'), m[0].trim() + '\n');
    const status = `updated: ${now}\n\n# Claude Code cycle summary\n\n` +
      (msg ? msg.slice(0, 4000) : '_(no message captured)_') + '\n';
    fs.writeFileSync(path.join(BUS, 'cc-status.md'), status);
  } catch (e) {
    // Never break the session because of the hook.
  }
  process.exit(0); // allow Claude Code to stop normally
});
