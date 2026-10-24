/** Copy-to-clipboard for the email, with a clear confirmation. */

import { toast } from './toast.js';

export function initClipboard() {
  const btn = document.getElementById('copyEmail');
  const action = document.getElementById('copyEmailAction');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const email = btn.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      // Clipboard API refused (insecure context, permissions) — fall back
      const field = document.createElement('textarea');
      field.value = email;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      try { document.execCommand('copy'); } catch { location.href = `mailto:${email}`; return; }
      field.remove();
    }
    if (action) {
      action.textContent = 'Copied ✓';
      setTimeout(() => { action.textContent = 'Copy'; }, 2200);
    }
    toast('Email copied');
  });
}
