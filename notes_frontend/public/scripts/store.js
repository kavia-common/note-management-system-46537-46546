//
// Simple Notes Store with localStorage persistence and pluggable adapter
//

// PUBLIC_INTERFACE
export const noteStore = (function () {
  /**
   * PUBLIC_INTERFACE
   * Initialize store: loads from adapter/localStorage and seeds an example note if empty.
   */
  function init() {
    state.items = adapter.load();
    if (!state.items || state.items.length === 0) {
      const seeded = seed();
      state.items = seeded;
      adapter.save(state.items);
    }
    // Sort initially
    sortItems();
    // Select first by default
    state.selectedId = state.items[0]?.id || null;
    notify();
  }

  /**
   * PUBLIC_INTERFACE
   * Subscribe to store updates.
   * @param {(state: State)=>void} listener
   * @returns {()=>void} unsubscribe
   */
  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  /**
   * PUBLIC_INTERFACE
   * Create a new note and select it.
   */
  function create() {
    const n = newNote();
    state.items.unshift(n);
    state.selectedId = n.id;
    persist();
    notify();
  }

  /**
   * PUBLIC_INTERFACE
   * Get a note by id.
   * @param {string} id
   */
  function get(id) {
    return state.items.find((n) => n.id === id) || null;
  }

  /**
   * PUBLIC_INTERFACE
   * Update a note by id with partial fields.
   * @param {string} id
   * @param {{title?: string, content?: string}} patch
   */
  function update(id, patch) {
    const note = get(id);
    if (!note) return;
    if (typeof patch.title === 'string') note.title = patch.title;
    if (typeof patch.content === 'string') note.content = patch.content;
    note.updatedAt = Date.now();
    sortItems();
    persist();
    notify();
  }

  /**
   * PUBLIC_INTERFACE
   * Remove a note by id.
   */
  function remove(id) {
    const idx = state.items.findIndex((n) => n.id === id);
    if (idx >= 0) {
      state.items.splice(idx, 1);
      if (state.selectedId === id) {
        state.selectedId = state.items[0]?.id || null;
      }
      persist();
      notify();
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Select a note id to view/edit.
   */
  function select(id) {
    if (state.selectedId !== id) {
      state.selectedId = id;
      notify();
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Current selected note (or null).
   */
  function current() {
    return get(state.selectedId);
  }

  /**
   * PUBLIC_INTERFACE
   * List items with search filter and lastUpdated desc sort.
   * @param {{query?: string}} opts
   */
  function list(opts = {}) {
    const q = (opts.query || '').toLowerCase();
    const items = !q
      ? [...state.items]
      : state.items.filter((n) => (n.title || '').toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q));
    return { items, selectedId: state.selectedId };
  }

  return {
    init, subscribe, create, get, update, remove, select, current, list,
  };

  // Internal state
  /** @type {{items: Note[], selectedId: string|null}} */
  var state = { items: [], selectedId: null };
  /** @type {Set<Function>} */
  var listeners = new Set();

  function notify() {
    for (const fn of listeners) {
      try { fn(state); } catch {}
    }
  }

  function persist() {
    adapter.save(state.items);
  }

  function sortItems() {
    state.items.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  // Entities
  function newNote() {
    const now = Date.now();
    return {
      id: cryptoRandomId(),
      title: '',
      content: '',
      createdAt: now,
      updatedAt: now,
    };
  }

  function seed() {
    const now = Date.now();
    return [
      {
        id: cryptoRandomId(),
        title: 'Welcome to Notes',
        content:
`# Welcome

This is your first note. It supports Markdown.

- Create notes with the + New button
- Use Ctrl/Cmd+S to save
- Use Ctrl/Cmd+N to quickly start a new note
- Your notes are saved locally (offline-first)

Enjoy writing!`,
        createdAt: now - 1000,
        updatedAt: now - 1000,
      },
    ];
  }

  // Storage adapter (localStorage)
  const adapter = (function createAdapter() {
    const KEY = 'notes.v1';
    // Future: if PUBLIC_API_BASE is defined and online, swap to HTTP-based adapter.
    // For now, localStorage only.
    return {
      load() {
        try {
          const raw = localStorage.getItem(KEY);
          if (!raw) return [];
          const parsed = JSON.parse(raw);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      },
      save(items) {
        try {
          localStorage.setItem(KEY, JSON.stringify(items));
        } catch {
          // ignore quota or private mode issues
        }
      },
    };
  })();

  // Helpers
  function cryptoRandomId() {
    // RFC4122-like simple id
    const arr = crypto.getRandomValues(new Uint8Array(16));
    arr[6] = (arr[6] & 0x0f) | 0x40;
    arr[8] = (arr[8] & 0x3f) | 0x80;
    const hex = [...arr].map((b) => b.toString(16).padStart(2, '0'));
    return `${hex[0]}${hex[1]}${hex[2]}${hex[3]}-${hex[4]}${hex[5]}-${hex[6]}${hex[7]}-${hex[8]}${hex[9]}-${hex[10]}${hex[11]}${hex[12]}${hex[13]}${hex[14]}${hex[15]}`;
  }
})();

/**
 * Types:
 * @typedef {Object} Note
 * @property {string} id
 * @property {string} title
 * @property {string} content
 * @property {number} createdAt
 * @property {number} updatedAt
 */
