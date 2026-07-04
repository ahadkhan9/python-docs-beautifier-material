/* ==========================================================================
   Python Docs Beautifier - Settings Popup Logic (popup.js)
   ========================================================================== */

(function() {
  'use strict';

  // Constants & Defaults matching content.js
  const DEFAULTS = {
    theme: 'dark',
    sidebarState: 'expanded',
    fontSizeScale: '1.0',
    fontFamily: 'inter',
    lineSpacing: 'normal',
    contentWidth: 'standard'
  };

  const isExtension = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;

  // Local helper storage fallback (to inspect options in standalone mode)
  const storageFallback = {
    get: (keys, cb) => {
      const res = {};
      keys.forEach(k => {
        res[k] = localStorage.getItem(`py_mat_${k}`) || DEFAULTS[k];
      });
      cb(res);
    },
    set: (data, cb) => {
      Object.entries(data).forEach(([k, v]) => {
        localStorage.setItem(`py_mat_${k}`, v);
      });
      if (cb) cb();
    }
  };

  const db = {
    get: (keys, cb) => {
      if (isExtension) {
        chrome.storage.local.get(keys, cb);
      } else {
        storageFallback.get(keys, cb);
      }
    },
    set: (data, cb) => {
      if (isExtension) {
        chrome.storage.local.set(data, cb);
      } else {
        storageFallback.set(data, cb);
      }
    }
  };

  // State
  let currentSettings = { ...DEFAULTS };
  let activeTabId = null;
  let debounceTimeoutId = null;

  // DOM Elements
  const themeCards = document.querySelectorAll('.theme-card');
  const fontSizeSlider = document.getElementById('font-size-slider');
  const fontSizeValue = document.getElementById('font-size-value');
  const btnSizeDec = document.getElementById('btn-size-dec');
  const btnSizeInc = document.getElementById('btn-size-inc');
  const fontFamilyControl = document.getElementById('font-family-control');
  const lineSpacingControl = document.getElementById('line-spacing-control');
  const contentWidthControl = document.getElementById('content-width-control');
  const focusModeToggle = document.getElementById('focus-mode-toggle');
  const btnReset = document.getElementById('btn-reset');
  const livePreviewBanner = document.getElementById('live-preview-banner');

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    // 1. Get active tab to check warning banner and check focus mode state
    checkActiveTab();

    // 2. Load stored settings and setup UI
    loadSettings();

    // 3. Bind UI event listeners
    bindEvents();
  });

  function checkActiveTab() {
    if (isExtension) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab) {
          activeTabId = activeTab.id;
          
          // Check if on Python Docs page
          const url = activeTab.url || '';
          if (!url.startsWith('https://docs.python.org/')) {
            livePreviewBanner.style.display = 'flex';
          } else {
            // Query tab to see if Focus Mode is active
            chrome.tabs.sendMessage(activeTabId, { action: 'getFocusMode' }, (response) => {
              if (chrome.runtime.lastError) {
                // Content script might not be injected yet
                return;
              }
              if (response && response.focusMode !== undefined) {
                focusModeToggle.checked = response.focusMode;
              }
            });
          }
        }
      });
    }
  }

  function loadSettings() {
    const keys = ['theme', 'sidebarState', 'fontSizeScale', 'fontFamily', 'lineSpacing', 'contentWidth'];
    db.get(keys, (settings) => {
      currentSettings = {
        theme: settings.theme || DEFAULTS.theme,
        sidebarState: settings.sidebarState || DEFAULTS.sidebarState,
        fontSizeScale: settings.fontSizeScale || DEFAULTS.fontSizeScale,
        fontFamily: settings.fontFamily || DEFAULTS.fontFamily,
        lineSpacing: settings.lineSpacing || DEFAULTS.lineSpacing,
        contentWidth: settings.contentWidth || DEFAULTS.contentWidth
      };

      // Set theme attribute on HTML to match popup visual style to user preference
      document.documentElement.setAttribute('data-theme', currentSettings.theme);

      // Render Theme Cards
      themeCards.forEach(card => {
        const val = card.getAttribute('data-value');
        card.classList.toggle('active', val === currentSettings.theme);
      });

      // Render Font Size Slider
      const scaleVal = parseFloat(currentSettings.fontSizeScale);
      fontSizeSlider.value = scaleVal;
      fontSizeValue.textContent = `${Math.round(scaleVal * 100)}%`;

      // Render Segmented Controls
      setSegmentActive(fontFamilyControl, currentSettings.fontFamily);
      setSegmentActive(lineSpacingControl, currentSettings.lineSpacing);
      setSegmentActive(contentWidthControl, currentSettings.contentWidth);

      // Apply font family to popup body to stay in visual sync
      const fontStack = currentSettings.fontFamily === 'lora' ? '"Lora", Georgia, serif' : 
                        (currentSettings.fontFamily === 'system' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' : 
                        '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
      document.body.style.fontFamily = fontStack;
    });
  }

  function setSegmentActive(parent, value) {
    if (!parent) return;
    parent.querySelectorAll('.segment-btn').forEach(btn => {
      const active = btn.getAttribute('data-value') === value;
      btn.classList.toggle('active', active);
    });
  }

  function bindEvents() {
    // Theme Card Click
    themeCards.forEach(card => {
      card.addEventListener('click', () => {
        const val = card.getAttribute('data-value');
        updateSetting('theme', val);
        document.documentElement.setAttribute('data-theme', val);
        themeCards.forEach(c => c.classList.toggle('active', c === card));
      });
    });

    // Font Size Slider change & input
    fontSizeSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      fontSizeValue.textContent = `${Math.round(val * 100)}%`;
      // Debounce writing to storage for performance
      debounce(() => {
        updateSetting('fontSizeScale', val.toFixed(2));
      }, 80);
    });

    fontSizeSlider.addEventListener('change', (e) => {
      // Force instant storage save on mouseup (final value)
      const val = parseFloat(e.target.value);
      if (debounceTimeoutId) {
        clearTimeout(debounceTimeoutId);
      }
      updateSetting('fontSizeScale', val.toFixed(2));
    });

    // Font Size Nudge buttons
    btnSizeDec.addEventListener('click', () => {
      adjustSlider(-0.05);
    });

    btnSizeInc.addEventListener('click', () => {
      adjustSlider(0.05);
    });

    // Segmented Controls Pill clicks
    setupSegmentGroup(fontFamilyControl, 'fontFamily');
    setupSegmentGroup(lineSpacingControl, 'lineSpacing');
    setupSegmentGroup(contentWidthControl, 'contentWidth');

    // Focus Mode Toggle Switch
    focusModeToggle.addEventListener('change', (e) => {
      const active = e.target.checked;
      if (isExtension && activeTabId) {
        chrome.tabs.sendMessage(activeTabId, { action: 'toggleFocusMode', value: active }, () => {
          // Suppress error if content script hasn't loaded yet
          const err = chrome.runtime.lastError;
        });
      }
    });

    // Reset Button double confirm
    let resetTimerId = null;
    btnReset.addEventListener('click', () => {
      if (btnReset.classList.contains('confirm-state')) {
        // Second click: perform reset
        clearTimeout(resetTimerId);
        btnReset.classList.remove('confirm-state');
        btnReset.textContent = 'Reset all to default';
        
        // Reset all storage keys to default
        db.set(DEFAULTS, () => {
          loadSettings();
          // Tell active tab to deactivate focus mode as well
          if (isExtension && activeTabId) {
            chrome.tabs.sendMessage(activeTabId, { action: 'toggleFocusMode', value: false }, () => {
              // Suppress error if content script hasn't loaded yet
              const err = chrome.runtime.lastError;
            });
            focusModeToggle.checked = false;
          }
        });
      } else {
        // First click: prompt user
        btnReset.classList.add('confirm-state');
        btnReset.textContent = 'Confirm Reset?';
        
        // 3 second cancel window
        resetTimerId = setTimeout(() => {
          btnReset.classList.remove('confirm-state');
          btnReset.textContent = 'Reset all to default';
        }, 3000);
      }
    });
  }

  function setupSegmentGroup(parent, key) {
    if (!parent) return;
    parent.querySelectorAll('.segment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-value');
        updateSetting(key, val);
        setSegmentActive(parent, val);
      });
    });
  }

  function adjustSlider(delta) {
    let val = parseFloat(fontSizeSlider.value) + delta;
    val = Math.max(0.85, Math.min(1.50, val));
    fontSizeSlider.value = val;
    fontSizeValue.textContent = `${Math.round(val * 100)}%`;
    if (debounceTimeoutId) {
      clearTimeout(debounceTimeoutId);
    }
    updateSetting('fontSizeScale', val.toFixed(2));
  }

  function updateSetting(key, value) {
    currentSettings[key] = value;
    db.set({ [key]: value });
  }

  function debounce(func, delay) {
    if (debounceTimeoutId) {
      clearTimeout(debounceTimeoutId);
    }
    debounceTimeoutId = setTimeout(func, delay);
  }

  // --- Sync Listeners to Keep Popup UI Synced to External Modifications ---
  if (isExtension && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') {
        loadSettings();
      }
    });
  }

  if (isExtension && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((request) => {
      if (request.action === 'focusModeChanged') {
        focusModeToggle.checked = request.value;
      }
    });
  }

})();
