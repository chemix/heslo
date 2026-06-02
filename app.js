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

  const hasCrypto = () => Boolean(globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function');

  function randomUint32() {
    if (!hasCrypto()) {
      throw new Error('crypto.getRandomValues is not available');
    }
    const values = new Uint32Array(1);
    globalThis.crypto.getRandomValues(values);
    return values[0];
  }

  function randomInt(maxExclusive) {
    if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
      throw new Error('maxExclusive must be a positive integer');
    }
    const limit = Math.floor(0x100000000 / maxExclusive) * maxExclusive;
    let value;
    do {
      value = randomUint32();
    } while (value >= limit);
    return value % maxExclusive;
  }

  function pick(chars) {
    return chars[randomInt(chars.length)];
  }

  function shuffle(items) {
    const arr = items.slice();
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = randomInt(i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function selectedSets(options) {
    return [
      options.lowercase ? LOWER : '',
      options.uppercase ? UPPER : '',
      options.numbers ? NUMBERS : '',
      options.symbols ? SYMBOLS : ''
    ].filter(Boolean);
  }

  function generatePassword(options) {
    const length = Number(options.length);
    const sets = selectedSets(options);
    if (sets.length === 0) throw new Error('Vyber aspoň jednu znakovou sadu.');
    if (!Number.isInteger(length) || length < 1) throw new Error('Délka musí být kladné číslo.');

    const allChars = sets.join('');
    const required = sets.slice(0, Math.min(sets.length, length)).map(pick);
    const rest = Array.from({ length: Math.max(0, length - required.length) }, () => pick(allChars));
    return shuffle(required.concat(rest)).join('');
  }

  function generatePassphrase(options) {
    const count = Number(options.wordCount);
    const separator = String(options.separator ?? '-');
    if (!Number.isInteger(count) || count < 1) throw new Error('Počet slov musí být kladné číslo.');

    const words = Array.from({ length: count }, () => WORDS[randomInt(WORDS.length)]);
    const normalized = options.capitalize
      ? words.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      : words;
    const suffix = options.appendNumber ? String(randomInt(100)) : '';
    return normalized.join(separator) + suffix;
  }

  function estimatePasswordEntropy(options) {
    const sets = selectedSets(options);
    const poolSize = sets.join('').length;
    return poolSize > 0 ? Number(options.length) * Math.log2(poolSize) : 0;
  }

  function estimatePassphraseEntropy(options) {
    const base = Number(options.wordCount) * Math.log2(WORDS.length);
    return base + (options.appendNumber ? Math.log2(100) : 0);
  }

  function strength(entropy) {
    if (entropy >= 100) return { label: 'Silné', level: 'strong', width: 100 };
    if (entropy >= 70) return { label: 'OK', level: 'ok', width: 72 };
    if (entropy >= 45) return { label: 'Slabší', level: 'ok', width: 48 };
    return { label: 'Slabé', level: 'weak', width: 24 };
  }

  function init() {
    const el = {
      form: document.getElementById('settingsForm'),
      result: document.getElementById('result'),
      copyBtn: document.getElementById('copyBtn'),
      generateBtn: document.getElementById('generateBtn'),
      copyHint: document.getElementById('copyHint'),
      cryptoStatus: document.getElementById('cryptoStatus'),
      modeBadge: document.getElementById('modeBadge'),
      length: document.getElementById('length'),
      lengthValue: document.getElementById('lengthValue'),
      wordCount: document.getElementById('wordCount'),
      wordCountValue: document.getElementById('wordCountValue'),
      passwordOptions: document.getElementById('passwordOptions'),
      passphraseOptions: document.getElementById('passphraseOptions'),
      meterFill: document.getElementById('meterFill'),
      strengthLabel: document.getElementById('strengthLabel'),
      entropyHint: document.getElementById('entropyHint')
    };

    const getOptions = () => ({
      mode: new FormData(el.form).get('mode'),
      length: Number(el.length.value),
      lowercase: document.getElementById('lowercase').checked,
      uppercase: document.getElementById('uppercase').checked,
      numbers: document.getElementById('numbers').checked,
      symbols: document.getElementById('symbols').checked,
      wordCount: Number(el.wordCount.value),
      separator: document.getElementById('separator').value,
      capitalize: document.getElementById('capitalize').checked,
      appendNumber: document.getElementById('appendNumber').checked
    });

    const setCryptoStatus = () => {
      const dot = el.cryptoStatus.querySelector('.dot');
      if (hasCrypto()) {
        dot.className = 'dot dot--connected';
        el.cryptoStatus.lastChild.textContent = ' crypto.getRandomValues active';
      } else {
        dot.className = 'dot dot--error';
        el.cryptoStatus.lastChild.textContent = ' crypto API není dostupné';
        el.generateBtn.disabled = true;
      }
    };

    const updateMode = () => {
      const options = getOptions();
      const passphrase = options.mode === 'passphrase';
      el.passwordOptions.hidden = passphrase;
      el.passphraseOptions.hidden = !passphrase;
      el.modeBadge.textContent = passphrase ? 'Passphrase' : 'Password';
      updateEntropy(options);
    };

    const updateEntropy = (options = getOptions()) => {
      const entropy = options.mode === 'passphrase'
        ? estimatePassphraseEntropy(options)
        : estimatePasswordEntropy(options);
      const info = strength(entropy);
      el.meterFill.style.width = `${info.width}%`;
      el.meterFill.dataset.level = info.level;
      el.strengthLabel.textContent = info.label;
      el.entropyHint.textContent = `${Math.round(entropy)} bitů odhadované entropie`;
    };

    const generate = () => {
      try {
        const options = getOptions();
        el.result.value = options.mode === 'passphrase'
          ? generatePassphrase(options)
          : generatePassword(options);
        updateEntropy(options);
        el.copyHint.textContent = 'Vygenerováno lokálně v prohlížeči.';
      } catch (error) {
        el.copyHint.textContent = error.message;
      }
    };

    const copy = async () => {
      if (!el.result.value) generate();
      el.result.focus();
      el.result.select();
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(el.result.value);
          el.copyHint.textContent = 'Zkopírováno do schránky.';
        } else {
          document.execCommand('copy');
          el.copyHint.textContent = 'Zkopírováno fallback metodou.';
        }
      } catch {
        el.copyHint.textContent = 'Nepodařilo se kopírovat automaticky — text je označený.';
      }
    };

    el.length.addEventListener('input', () => { el.lengthValue.textContent = el.length.value; updateEntropy(); });
    el.wordCount.addEventListener('input', () => { el.wordCountValue.textContent = el.wordCount.value; updateEntropy(); });
    el.form.addEventListener('input', updateMode);
    el.generateBtn.addEventListener('click', generate);
    el.copyBtn.addEventListener('click', copy);

    setCryptoStatus();
    updateMode();
    if (hasCrypto()) generate();
  }

  globalThis.PasswordMvp = {
    WORDS,
    hasCrypto,
    randomInt,
    generatePassword,
    generatePassphrase,
    estimatePasswordEntropy,
    estimatePassphraseEntropy,
    strength
  };

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
