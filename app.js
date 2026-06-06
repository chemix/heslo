(() => {
  'use strict';

  const LOWER = 'abcdefghijklmnopqrstuvwxyz';
  const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const NUMBERS = '0123456789';
  const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.?/';
  const WORDS = [
    'amber', 'atlas', 'breeze', 'brick', 'canyon', 'cedar', 'cipher', 'clover',
    'comet', 'copper', 'delta', 'ember', 'falcon', 'field', 'fjord', 'forest',
    'galaxy', 'garden', 'glacier', 'harbor', 'hazel', 'island', 'jade', 'juniper',
    'kernel', 'lagoon', 'lantern', 'lithium', 'maple', 'marble', 'matrix', 'meadow',
    'meteor', 'nebula', 'night', 'nova', 'onyx', 'orbit', 'pepper', 'phoenix',
    'pixel', 'planet', 'quartz', 'river', 'rocket', 'saffron', 'shadow', 'signal',
    'silver', 'spruce', 'summit', 'thunder', 'tiger', 'velvet', 'violet', 'walnut'
  ];

  const NO_SET_MSG = 'Vyber aspoň jednu znakovou sadu.';

  function randomInt(maxExclusive) {
    const limit = Math.floor(0x100000000 / maxExclusive) * maxExclusive;
    const values = new Uint32Array(1);
    let value;
    do {
      crypto.getRandomValues(values);
      value = values[0];
    } while (value >= limit);
    return value % maxExclusive;
  }

  const pick = (chars) => chars[randomInt(chars.length)];

  function shuffle(items) {
    for (let i = items.length - 1; i > 0; i -= 1) {
      const j = randomInt(i + 1);
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  }

  function generateRandom(length, sets) {
    const all = sets.join('');
    const required = sets.map(pick);
    const rest = Array.from({ length: length - required.length }, () => pick(all));
    return shuffle(required.concat(rest)).join('');
  }

  function generateMemorable(count) {
    const words = Array.from({ length: count }, () => WORDS[randomInt(WORDS.length)]);
    return words.join('-') + randomInt(100);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const result = document.getElementById('result');
    const copyBtn = document.getElementById('copyBtn');
    const generateBtn = document.getElementById('generateBtn');
    const copyHint = document.getElementById('copyHint');
    const length = document.getElementById('length');
    const wordCount = document.getElementById('wordCount');
    const randomOptions = document.getElementById('randomOptions');
    const memorableOptions = document.getElementById('memorableOptions');
    const boxes = {
      lowercase: document.getElementById('lowercase'),
      uppercase: document.getElementById('uppercase'),
      numbers: document.getElementById('numbers'),
      symbols: document.getElementById('symbols')
    };

    // Parse an integer input, defaulting and clamping into [min, max].
    const readCount = (input, min, max, fallback) => {
      const v = parseInt(input.value, 10);
      return Math.max(min, Math.min(max, Number.isFinite(v) ? v : fallback));
    };

    const readLength = () => readCount(length, 4, 256, 32);
    const readWordCount = () => readCount(wordCount, 2, 12, 4);

    // The generation mode is owned by the Random/Memorable tabs; the Tabulka
    // tab is a separate view that must not disturb it, so keep the mode in
    // state instead of reading it back off whichever tab is selected.
    let currentMode = 'random';
    const mode = () => currentMode;

    // Returns a password using the current settings, or null if random mode
    // has no character set selected (caller reports the error).
    const generateOne = () => {
      if (mode() === 'memorable') {
        return generateMemorable(readWordCount());
      }
      const sets = [
        boxes.lowercase.checked ? LOWER : '',
        boxes.uppercase.checked ? UPPER : '',
        boxes.numbers.checked ? NUMBERS : '',
        boxes.symbols.checked ? SYMBOLS : ''
      ].filter(Boolean);
      if (sets.length === 0) return null;
      return generateRandom(readLength(), sets);
    };

    // Scale the result font down as the password gets longer so short ones
    // read large and long ones still fit on one line.
    const adjustResultFontSize = () => {
      const len = result.value.length;
      if (!len) { result.style.fontSize = ''; return; }
      const clamped = Math.max(12, Math.min(100, len));
      const t = (clamped - 12) / (100 - 12);
      result.style.fontSize = (1.6 - t * (1.6 - 0.72)).toFixed(3) + 'rem';
    };

    const run = () => {
      copyHint.textContent = '';
      const pw = generateOne();
      if (pw === null) {
        copyHint.textContent = NO_SET_MSG;
        return;
      }
      result.value = pw;
      adjustResultFontSize();
    };

    const COPY_ICON = copyBtn.innerHTML;
    const CHECK_ICON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>';

    let copyResetTimer;
    const flashCopied = () => {
      clearTimeout(copyResetTimer);
      copyBtn.innerHTML = CHECK_ICON;
      copyBtn.classList.add('copy-btn--done');
      copyResetTimer = setTimeout(() => {
        copyBtn.innerHTML = COPY_ICON;
        copyBtn.classList.remove('copy-btn--done');
      }, 1200);
    };

    const copy = async () => {
      if (!result.value) run();
      try {
        await navigator.clipboard.writeText(result.value);
      } catch {
        result.select();
      }
      flashCopied();
    };

    // --- Dropdown menu (caret next to Generate) ---
    const moreBtn = document.getElementById('moreBtn');
    const moreMenu = document.getElementById('moreMenu');

    const toggleMenu = (open) => {
      const show = open ?? moreMenu.hidden;
      moreMenu.hidden = !show;
      moreBtn.setAttribute('aria-expanded', String(show));
    };

    moreBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleMenu(); });

    // --- Count presets popovers (length + word count) ---
    // Wire a "presets" popover button to an input: clicking a preset fills the
    // input and regenerates; a hand-typed value is normalized on change.
    // Returns a closer so the document-level handlers can dismiss it.
    const setupPresets = (btnId, popupId, input, normalize) => {
      const btn = document.getElementById(btnId);
      const popup = document.getElementById(popupId);
      const toggle = (open) => {
        const show = open ?? popup.hidden;
        popup.hidden = !show;
        btn.setAttribute('aria-expanded', String(show));
      };
      btn.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });
      popup.addEventListener('click', (e) => {
        const preset = e.target.closest('button[data-value]');
        if (!preset) return;
        input.value = preset.dataset.value;
        toggle(false);
        run();
      });
      input.addEventListener('change', () => { input.value = String(normalize()); run(); });
      return () => toggle(false);
    };

    const closePresets = [
      setupPresets('lengthPresetsBtn', 'lengthPresets', length, readLength),
      setupPresets('wordCountPresetsBtn', 'wordCountPresets', wordCount, readWordCount)
    ];

    const closeAllMenus = () => { toggleMenu(false); closePresets.forEach((close) => close()); };
    document.addEventListener('click', closeAllMenus);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAllMenus(); });

    // --- Bulk: passwords into a table ---
    const generatorCard = document.getElementById('generatorCard');
    const tableCard = document.getElementById('tableCard');
    const tableBody = document.getElementById('tableBody');
    const tableHint = document.getElementById('tableHint');
    const bulkBtn = document.getElementById('bulkBtn');
    const addRowBtn = document.getElementById('addRowBtn');
    const copyTableBtn = document.getElementById('copyTableBtn');

    // --- Tabs: Random / Memorable pick the generator mode; a Tabulka tab is
    // created on demand for the bulk table, can be returned to at any time, and
    // closes back to the generator. ---
    const tabsEl = document.querySelector('.tabs');

    // Reveal exactly one panel and highlight exactly one tab.
    const showPanel = (tab) => {
      document.querySelectorAll('.tab').forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
      const toTable = tab.dataset.target === 'tableCard';
      generatorCard.hidden = toTable;
      tableCard.hidden = !toTable;
      (toTable ? tableCard : generatorCard).setAttribute('aria-labelledby', tab.id);
    };

    // A generator tab carries the mode: activating it shows the matching
    // options and rerolls the single-password view.
    const selectMode = (tab) => {
      currentMode = tab.dataset.mode;
      const memorable = currentMode === 'memorable';
      randomOptions.hidden = memorable;
      memorableOptions.hidden = !memorable;
      showPanel(tab);
      run();
    };
    document.querySelectorAll('.tab[data-mode]').forEach((t) => t.addEventListener('click', () => selectMode(t)));

    // The Tabulka tab is created lazily and reused; closing it drops the table
    // and returns to the generator tab for the current mode.
    let tableTab = null;
    const closeTableTab = () => {
      if (!tableTab) return;
      const wasActive = tableTab.getAttribute('aria-selected') === 'true';
      tableTab.remove();
      tableTab = null;
      tableBody.innerHTML = '';
      if (wasActive) selectMode(document.getElementById(mode() === 'memorable' ? 'tab-memorable' : 'tab-random'));
      else tableCard.hidden = true;
    };
    const ensureTableTab = () => {
      if (tableTab) return tableTab;
      tableTab = document.createElement('button');
      tableTab.type = 'button';
      tableTab.className = 'tab';
      tableTab.id = 'tab-table';
      tableTab.dataset.target = 'tableCard';
      tableTab.setAttribute('role', 'tab');
      tableTab.setAttribute('aria-controls', 'tableCard');
      tableTab.setAttribute('aria-selected', 'false');
      tableTab.innerHTML = '<span class="tab-label">Tabulka</span>'
        + '<span class="tab-close" title="Zavřít tabulku" aria-hidden="true">×</span>';
      tableTab.addEventListener('click', (e) => {
        if (e.target.closest('.tab-close')) closeTableTab();
        else showPanel(tableTab);
      });
      tableTab.addEventListener('keydown', (e) => {
        if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); closeTableTab(); }
      });
      tabsEl.appendChild(tableTab);
      return tableTab;
    };

    // Roll a password; on failure (no charset selected) show the table hint
    // and return null so the caller can bail.
    const nextPasswordOrWarn = () => {
      tableHint.textContent = '';
      const pw = generateOne();
      if (pw === null) tableHint.textContent = NO_SET_MSG;
      return pw;
    };

    const REGEN_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>';

    // Build one table row; the regenerate button re-rolls just this cell.
    const makeRow = (index, pw) => {
      const tr = document.createElement('tr');

      const num = document.createElement('td');
      num.className = 'col-num';
      num.textContent = String(index);

      const userCell = document.createElement('td');
      const userInput = document.createElement('input');
      userInput.className = 'input username-input';
      userInput.type = 'text';
      userInput.placeholder = 'username';
      userInput.autocomplete = 'off';
      userInput.spellcheck = false;
      userCell.appendChild(userInput);

      const pwCell = document.createElement('td');
      pwCell.className = 'pw-cell';
      pwCell.textContent = pw;

      const actionCell = document.createElement('td');
      actionCell.className = 'col-action';
      const regenBtn = document.createElement('button');
      regenBtn.type = 'button';
      regenBtn.className = 'btn btn--outline regen-btn';
      // Skip the regenerate button in Tab order so focus walks the username
      // inputs one after another; it stays clickable.
      regenBtn.tabIndex = -1;
      regenBtn.title = 'Přegenerovat heslo';
      regenBtn.setAttribute('aria-label', 'Přegenerovat heslo');
      regenBtn.innerHTML = REGEN_ICON;
      regenBtn.addEventListener('click', () => {
        const next = nextPasswordOrWarn();
        if (next !== null) pwCell.textContent = next;
      });
      actionCell.appendChild(regenBtn);

      tr.append(num, userCell, pwCell, actionCell);
      return tr;
    };

    const generateTable = () => {
      const rows = [];
      for (let i = 0; i < 10; i += 1) {
        const pw = nextPasswordOrWarn();
        if (pw === null) return false;
        rows.push(pw);
      }
      tableBody.innerHTML = '';
      rows.forEach((pw, i) => tableBody.appendChild(makeRow(i + 1, pw)));
      return true;
    };

    const addRow = () => {
      const pw = nextPasswordOrWarn();
      if (pw === null) return;
      tableBody.appendChild(makeRow(tableBody.children.length + 1, pw));
    };

    bulkBtn.addEventListener('click', () => {
      toggleMenu(false);
      if (generateTable()) showPanel(ensureTableTab());
    });

    addRowBtn.addEventListener('click', addRow);

    // Build an ASCII table from the current usernames + passwords
    const asciiTable = () => {
      const rows = Array.from(tableBody.querySelectorAll('tr')).map((tr) => ({
        user: tr.querySelector('.username-input').value.trim(),
        pass: tr.querySelector('.pw-cell').textContent
      }));
      const headers = ['Username', 'Password'];
      const widths = headers.map((h, c) => {
        const cells = rows.map((r) => (c === 0 ? r.user : r.pass));
        return Math.max(h.length, ...cells.map((s) => s.length));
      });
      const sep = '+' + widths.map((w) => '-'.repeat(w + 2)).join('+') + '+';
      const line = (cells) => '| ' + cells.map((s, c) => s.padEnd(widths[c])).join(' | ') + ' |';
      return [sep, line(headers), sep, ...rows.map((r) => line([r.user, r.pass])), sep].join('\n');
    };

    let tableCopyTimer;
    copyTableBtn.addEventListener('click', async () => {
      const text = asciiTable();
      try {
        await navigator.clipboard.writeText(text);
      } catch { /* clipboard unavailable; ignore */ }
      clearTimeout(tableCopyTimer);
      copyTableBtn.textContent = 'Zkopírováno';
      tableCopyTimer = setTimeout(() => { copyTableBtn.textContent = 'Kopírovat tabulku'; }, 1200);
    });

    generateBtn.addEventListener('click', run);
    copyBtn.addEventListener('click', copy);
    run();
  });
})();
