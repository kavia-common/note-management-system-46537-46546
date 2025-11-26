//
// View helpers and small utilities
//

/**
 * PUBLIC_INTERFACE
 * Debounce a function by delay ms.
 */
export function debounce(fn, delay = 200) {
  let t = null;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

/**
 * PUBLIC_INTERFACE
 * Render the notes list into a container.
 * @param {HTMLElement} container
 * @param {Array<{id:string,title:string,content:string,updatedAt:number}>} items
 * @param {string|null} selectedId
 * @param {(id: string)=>void} onSelect
 */
export function renderList(container, items, selectedId, onSelect) {
  container.innerHTML = '';
  if (items.length === 0) {
    container.innerHTML = `<div class="note-item" aria-selected="false" role="listitem">No notes found</div>`;
    return;
  }
  const fragment = document.createDocumentFragment();
  for (const n of items) {
    const el = document.createElement('button');
    el.className = 'note-item';
    el.setAttribute('role', 'listitem');
    el.setAttribute('aria-selected', String(n.id === selectedId));
    el.title = n.title || 'Untitled';
    el.innerHTML = `
      <p class="note-item-title">${escapeHTML(n.title || 'Untitled')}</p>
      <div class="note-item-meta">${timeAgo(n.updatedAt)}</div>
    `;
    el.addEventListener('click', () => onSelect(n.id));
    fragment.appendChild(el);
  }
  container.appendChild(fragment);
}

/**
 * PUBLIC_INTERFACE
 * Render markdown preview (very small subset for safety).
 */
export function renderPreview(markdown, target) {
  target.innerHTML = mdToHtml(markdown || '');
}

/**
 * PUBLIC_INTERFACE
 * Show a toast notification.
 */
export function showToast(message) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 1200);
}

// Minimal Markdown to HTML (safe subset, no HTML passthrough)
function mdToHtml(src) {
  let s = src.replace(/\r\n/g, '\n');

  // Escape HTML
  s = escapeHTML(s);

  // Code blocks ```
  s = s.replace(/```([\s\S]*?)```/g, (_, code) => `<pre><code>${code}</code></pre>`);

  // Inline code `
  s = s.replace(/`([^`]+)`/g, (_, code) => `<code>${code}</code>`);

  // Headings
  s = s.replace(/^### (.*)$/gm, '<h3>$1</h3>');
  s = s.replace(/^## (.*)$/gm, '<h2>$1</h2>');
  s = s.replace(/^# (.*)$/gm, '<h1>$1</h1>');

  // Bold / Italic
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Lists
  s = s.replace(/^\s*-\s+(.*)$/gm, '<li>$1</li>');
  // Wrap consecutive <li> with <ul>
  s = s.replace(/(<li>[\s\S]*?<\/li>)(?!(\n<li>))/g, '$1\n');

  // Paragraphs: split by double newline
  s = s.split(/\n{2,}/).map(block => {
    if (/^<h[1-3]>/.test(block) || /^<pre>/.test(block) || /^<ul>/.test(block) || /^<li>/.test(block)) return block;
    if (block.trim().startsWith('<li>')) {
      // Group consecutive li
      const items = block.split(/\n/).filter(Boolean).join('');
      return `<ul>${items}</ul>`;
    }
    return `<p>${block.replace(/\n/g, '<br/>')}</p>`;
  }).join('\n');

  return s;
}

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'just now';
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function escapeHTML(s) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}
