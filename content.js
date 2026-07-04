(function() {
  'use strict';

  // State Management: Use chrome.storage when run as an extension, fallback to localStorage
  const isExtension = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;

  const fallbackGet = (keys, callback) => {
    const result = {};
    keys.forEach(key => {
      const val = localStorage.getItem(`py_mat_${key}`);
      result[key] = val;
    });
    callback(result);
  };

  const fallbackSet = (data, callback) => {
    Object.entries(data).forEach(([key, val]) => {
      localStorage.setItem(`py_mat_${key}`, val);
    });
    if (callback) callback();
  };

  const storage = {
    get: (keys, callback) => {
      if (isExtension) {
        try {
          chrome.storage.local.get(keys, (result) => {
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.lastError) {
              fallbackGet(keys, callback);
            } else {
              callback(result || {});
            }
          });
          return;
        } catch (e) {
          // Extension context invalidated
        }
      }
      fallbackGet(keys, callback);
    },
    set: (data, callback) => {
      if (isExtension) {
        try {
          chrome.storage.local.set(data, () => {
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.lastError) {
              fallbackSet(data, callback);
            } else {
              if (callback) callback();
            }
          });
          return;
        } catch (e) {
          // Extension context invalidated
        }
      }
      fallbackSet(data, callback);
    }
  };

  // 1. FOUC Avoidance: Apply initial state immediately at document_start
  function applyInitialState() {
    storage.get(['theme', 'sidebarState', 'fontSizeScale'], (settings) => {
      const theme = settings.theme || 'dark';
      const sidebarState = settings.sidebarState || 'expanded';
      const scale = settings.fontSizeScale || '1.0';

      document.documentElement.setAttribute('data-py-theme', theme);
      document.documentElement.setAttribute('data-py-sidebar', sidebarState);
      document.documentElement.style.setProperty('--font-size-scale', scale);
      
      // Prevent unstyled flash
      document.documentElement.setAttribute('data-py-ready', 'true');
    });
  }

  // Execute early preferences application
  applyInitialState();

  // 2. DOM Ready Actions
  document.addEventListener('DOMContentLoaded', () => {
    // Recheck states to ensure synchronization
    applyInitialState();

    // Table responsive wrappers
    wrapTables();

    // Build Premium Material Header
    injectMaterialHeader();

    // Merge related nav (prev/next/index/modules/switchers) into header
    mergeRelatedNav();

    // Build right-side ScrollSpy Table of Contents
    buildTableOfContents();

    // Setup Code Block copy utility
    enhanceCodeBlocks();

    // Setup global keyboard hotkeys
    setupKeyboardShortcuts();
  });

  /**
   * Restructures tables inside the body wrapper to prevent overflow
   */
  function wrapTables() {
    document.querySelectorAll('table.docutils').forEach(table => {
      if (table.parentElement.classList.contains('py-table-wrapper')) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'py-table-wrapper';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });
  }

  /**
   * Generates and injects the top sticky material header
   */
  function injectMaterialHeader() {
    if (document.getElementById('py-material-header')) return;

    const header = document.createElement('header');
    header.id = 'py-material-header';

    // SVGs for buttons
    const menuSvg = '<svg viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
    const themeSvg = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
    const githubSvg = '<svg viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>';
    const searchIconSvg = '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';

    // Build logo / title HTML
    let logoUrl = '../../python-docs-beautifier-material/icons/icon48.png';
    if (isExtension) {
      try {
        logoUrl = chrome.runtime.getURL('icons/icon48.png');
      } catch (e) {
        // Extension context invalidated fallback
      }
    }
    
    header.innerHTML = `
      <button class="md-header-btn" id="md-btn-menu" title="Toggle Navigation Sidebar (\\)">${menuSvg}</button>
      <a href="/" class="md-header-title">
        <img src="${logoUrl}" alt="Logo" onerror="this.src='https://www.python.org/static/favicon.ico'">
        <span>Python Docs</span>
      </a>
      
      <div class="md-header-search">
        <span class="md-search-icon">${searchIconSvg}</span>
        <input type="text" class="md-search-input" id="md-search-bar" placeholder="Search Python documentation... (Press '/' to focus)">
      </div>

      <div class="md-header-meta">
        <button class="md-header-btn" id="md-btn-theme" title="Cycle Theme (T)">${themeSvg}</button>
        <a href="https://github.com/python/cpython" target="_blank" class="md-header-btn" title="View Source on GitHub">${githubSvg}</a>
      </div>
    `;

    // Inject header at body start
    document.body.insertBefore(header, document.body.firstChild);

    // Event Handlers
    const btnMenu = document.getElementById('md-btn-menu');
    const btnTheme = document.getElementById('md-btn-theme');
    const searchBar = document.getElementById('md-search-bar');

    // Sync menu toggle active class
    storage.get(['sidebarState'], (settings) => {
      const isCollapsed = settings.sidebarState === 'collapsed';
      btnMenu.classList.toggle('active', !isCollapsed);
    });

    btnMenu.addEventListener('click', toggleSidebar);
    btnTheme.addEventListener('click', cycleTheme);

    // Forward header search query to standard Sphinx search
    searchBar.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = searchBar.value.trim();
        if (query) {
          // Resolve standard sphinx content root
          const relativeSearchUrl = getSphinxSearchUrl(query);
          window.location.href = relativeSearchUrl;
        }
      }
    });

    // Populate search bar value if currently on search page
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('q')) {
      searchBar.value = urlParams.get('q');
    }
  }

  /**
   * Helper to build search URL depending on the current documentation location path
   */
  function getSphinxSearchUrl(query) {
    // Determine path separator distance to root using data-content_root
    const htmlNode = document.documentElement;
    const contentRoot = htmlNode.getAttribute('data-content_root') || './';
    const baseUrl = contentRoot.endsWith('/') ? contentRoot : contentRoot + '/';
    return `${baseUrl}search.html?q=${encodeURIComponent(query)}`;
  }

  /**
   * Compiles right side Table of Contents dynamically and sets ScrollSpy observer
   */
  function buildTableOfContents() {
    let tocSidebar = document.querySelector('.md-sidebar-toc');
    if (!tocSidebar) {
      tocSidebar = document.createElement('div');
      tocSidebar.className = 'md-sidebar-toc';
      
      const docElement = document.querySelector('div.document');
      if (docElement) {
        docElement.appendChild(tocSidebar);
      } else {
        return; // document layout missing
      }
    }

    // Grab H1/H2/H3 elements inside standard body
    const headings = Array.from(document.querySelectorAll('div.body h1, div.body h2, div.body h3'));
    if (!headings.length) {
      tocSidebar.style.display = 'none';
      return;
    }

    const tocList = document.createElement('ul');
    tocList.className = 'md-toc-list';

    headings.forEach((heading, idx) => {
      // Ensure heading has an anchor identifier
      const id = heading.id || `py-header-${idx}`;
      heading.id = id;

      const li = document.createElement('li');
      li.className = `md-toc-item md-toc-level-${heading.tagName.toLowerCase()}`;

      const a = document.createElement('a');
      a.href = `#${id}`;
      // Strip header links symbol
      a.textContent = heading.textContent.replace('¶', '').trim();
      a.title = a.textContent;

      a.addEventListener('click', (e) => {
        e.preventDefault();
        const offset = 75; // accounts for sticky header
        const elementPosition = heading.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        history.pushState(null, null, `#${id}`);
      });

      li.appendChild(a);
      tocList.appendChild(li);
    });

    tocSidebar.innerHTML = '<h3>On this page</h3>';
    tocSidebar.appendChild(tocList);

    // ScrollSpy configuration
    const observerOptions = {
      root: null,
      rootMargin: '-90px 0px -60% 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          document.querySelectorAll('.md-toc-item a').forEach(link => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, observerOptions);

    headings.forEach(h => observer.observe(h));
  }

  /**
   * Code block copying support
   */
  async function enhanceCodeBlocks() {
    const codeBlocks = Array.from(document.querySelectorAll('div.highlight'));
    if (!codeBlocks.length) return;

    // Process blocks in microtasks to prevent main thread blocking
    const BATCH_SIZE = 10;
    for (let i = 0; i < codeBlocks.length; i += BATCH_SIZE) {
      await new Promise(resolve => requestAnimationFrame(() => {
        const batch = codeBlocks.slice(i, i + BATCH_SIZE);
        batch.forEach(block => {
          if (block.querySelector('.py-copy-btn')) return;

          const pre = block.querySelector('pre');
          if (!pre) return;

          const copyBtn = document.createElement('button');
          copyBtn.className = 'py-copy-btn';
          copyBtn.title = 'Copy code to clipboard';
          copyBtn.setAttribute('aria-label', 'Copy code');
          
          copyBtn.innerHTML = `
            <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <span>Copy</span>
          `;

          block.appendChild(copyBtn);

          copyBtn.addEventListener('click', async () => {
            const codeText = pre.innerText.replace(/\r\n/g, '\n').replace(/\n$/, '');
            try {
              await navigator.clipboard.writeText(codeText);
              
              // Success feedback state
              copyBtn.classList.add('copied');
              copyBtn.innerHTML = `
                <svg viewBox="0 0 24 24" style="stroke: #10b981;"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Copied!</span>
              `;

              setTimeout(() => {
                copyBtn.classList.remove('copied');
                copyBtn.innerHTML = `
                  <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  <span>Copy</span>
                `;
              }, 2000);
            } catch (err) {
              console.error('Failed to copy text:', err);
            }
          });
        });
        resolve();
      }));
    }
  }

  /**
   * Sidebar Expand/Collapse Toggler
   */
  function toggleSidebar() {
    const current = document.documentElement.getAttribute('data-py-sidebar') || 'expanded';
    const next = current === 'expanded' ? 'collapsed' : 'expanded';
    
    document.documentElement.setAttribute('data-py-sidebar', next);
    storage.set({ sidebarState: next });

    // Sync button active class
    const btnMenu = document.getElementById('md-btn-menu');
    if (btnMenu) {
      btnMenu.classList.toggle('active', next === 'expanded');
    }
    return next;
  }

  /**
   * Theme Cycler (Light -> Dark -> Sepia)
   */
  function cycleTheme() {
    const current = document.documentElement.getAttribute('data-py-theme') || 'dark';
    const order = ['dark', 'light', 'sepia'];
    const next = order[(order.indexOf(current) + 1) % order.length];
    
    document.documentElement.setAttribute('data-py-theme', next);
    storage.set({ theme: next });
    return next;
  }

  /**
   * Merges div.related nav links (prev/next/index/modules + version switcher)
   * into the material header, then hides the related bar.
   */
  function mergeRelatedNav() {
    const related = document.querySelector('div.related');
    if (!related) return;

    const prevLink    = related.querySelector('a[accesskey="P"]');
    const nextLink    = related.querySelector('a[accesskey="N"]');
    const indexLink   = related.querySelector('a[accesskey="I"]');
    const modulesLink = related.querySelector('a[href*="py-modindex"]');
    const langSwitcher = related.querySelector('.language_switcher_placeholder');
    const verSwitcher  = related.querySelector('.version_switcher_placeholder');

    const hasContent = prevLink || nextLink || indexLink || modulesLink || langSwitcher || verSwitcher;
    if (!hasContent) return;

    const nav = document.createElement('div');
    nav.className = 'md-header-nav';
    nav.setAttribute('aria-label', 'Chapter navigation');

    // ← Prev arrow button
    if (prevLink) {
      const btn = document.createElement('a');
      btn.href = prevLink.href;
      btn.className = 'md-header-nav-btn';
      btn.title = prevLink.getAttribute('title') || 'Previous chapter';
      btn.setAttribute('aria-label', 'Previous chapter');
      btn.innerHTML = `<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
      nav.appendChild(btn);
    }

    // → Next arrow button
    if (nextLink) {
      const btn = document.createElement('a');
      btn.href = nextLink.href;
      btn.className = 'md-header-nav-btn';
      btn.title = nextLink.getAttribute('title') || 'Next chapter';
      btn.setAttribute('aria-label', 'Next chapter');
      btn.innerHTML = `<svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
      nav.appendChild(btn);
    }

    // Separator before text links
    if ((prevLink || nextLink) && (indexLink || modulesLink || langSwitcher || verSwitcher)) {
      const sep = document.createElement('span');
      sep.className = 'md-header-sep';
      nav.appendChild(sep);
    }

    // Index text link
    if (indexLink) {
      const a = document.createElement('a');
      a.href = indexLink.href;
      a.className = 'md-header-nav-link';
      a.textContent = 'Index';
      nav.appendChild(a);
    }

    // Modules text link
    if (modulesLink) {
      const a = document.createElement('a');
      a.href = modulesLink.href;
      a.className = 'md-header-nav-link';
      a.textContent = 'Modules';
      nav.appendChild(a);
    }

    // Separator before switchers
    if ((indexLink || modulesLink) && (langSwitcher || verSwitcher)) {
      const sep = document.createElement('span');
      sep.className = 'md-header-sep';
      nav.appendChild(sep);
    }

    // Version / Language switchers (move DOM nodes so RTD scripts still find them)
    if (langSwitcher || verSwitcher) {
      const switcherDiv = document.createElement('div');
      switcherDiv.className = 'md-header-switchers';
      if (langSwitcher) switcherDiv.appendChild(langSwitcher);
      if (verSwitcher)  switcherDiv.appendChild(verSwitcher);
      nav.appendChild(switcherDiv);
    }

    // Insert between search bar and .md-header-meta
    const meta = document.querySelector('.md-header-meta');
    if (meta) {
      meta.parentElement.insertBefore(nav, meta);
    } else {
      document.getElementById('py-material-header')?.appendChild(nav);
    }
  }

  /**
   * Standard Hotkey Listener
   * \ : Toggle Sidebar
   * s / / : Focus search bar
   * t : Cycle theme
   */
  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ignore keypress when writing in input, textarea, etc.
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        return;
      }

      if (e.key === '\\') {
        e.preventDefault();
        toggleSidebar();
      }

      if (e.key === 's' || e.key === '/') {
        const searchInput = document.getElementById('md-search-bar');
        if (searchInput) {
          e.preventDefault();
          searchInput.focus();
          searchInput.select();
        }
      }

      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        cycleTheme();
      }
    });
  }

})();
