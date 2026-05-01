// ============================================================
//  OFFICE DISPLAY — ADMIN / PLAYLIST MANAGER
// ============================================================

// Apply saved theme immediately on load (themes.js is loaded before this file)
loadTheme();

const PLAYLIST_KEY = 'officeDisplayPlaylist';

const DEFAULT_PLAYLIST = [
  {
    id: 'default-dashboard',
    name: 'Dashboard',
    type: 'dashboard',
    src: '',
    duration: window.OFFICE_CONFIG?.defaultSlideDuration ?? 30,
    enabled: true,
    schedule: null,
  },
];

// ── Helpers ──────────────────────────────────────────────────

function $(id) { return document.getElementById(id); }

function generateId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function showToast(msg, color) {
  const t = $('toast');
  t.textContent = msg;
  t.style.borderColor = color || 'var(--accent2)';
  t.classList.add('visible');
  setTimeout(() => t.classList.remove('visible'), 2800);
}

function formatScheduleSummary(schedule) {
  if (!schedule) return 'Always active';
  const parts = [];

  const DOW_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const allDays = [0,1,2,3,4,5,6];
  const weekdays = [1,2,3,4,5];
  const weekend  = [0,6];

  const dows = schedule.daysOfWeek ?? allDays;
  const sorted = [...dows].sort((a,b) => a-b);

  if (sorted.length === 7)                                    parts.push('Every day');
  else if (JSON.stringify(sorted) === JSON.stringify(weekdays)) parts.push('Weekdays');
  else if (JSON.stringify(sorted) === JSON.stringify(weekend))  parts.push('Weekends');
  else parts.push(sorted.map(d => DOW_NAMES[d]).join(', '));

  if (schedule.startTime && schedule.endTime &&
      !(schedule.startTime === '00:00' && schedule.endTime === '23:59')) {
    parts.push(`${schedule.startTime}–${schedule.endTime}`);
  }

  if (schedule.startDate || schedule.endDate) {
    const s = schedule.startDate || '…';
    const e = schedule.endDate   || '…';
    parts.push(`${s} → ${e}`);
  }

  return parts.join(' · ');
}

function isCurrentlyActive(asset) {
  if (!asset.enabled) return false;
  if (!asset.schedule) return true;

  const now  = new Date();
  const date = now.toISOString().slice(0, 10);
  const pad  = n => String(n).padStart(2,'0');
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const dow  = now.getDay();

  const { startDate, endDate, daysOfWeek, startTime, endTime } = asset.schedule;
  if (startDate && date < startDate) return false;
  if (endDate   && date > endDate)   return false;
  if (daysOfWeek?.length && !daysOfWeek.includes(dow)) return false;
  if (startTime && endTime) {
    if (startTime <= endTime) {
      if (time < startTime || time > endTime) return false;
    } else {
      if (time < startTime && time > endTime) return false;
    }
  }
  return true;
}

// ── Playlist persistence ──────────────────────────────────────

// ── Theme picker ──────────────────────────────────────────────

function renderThemePicker() {
  const grid = $('theme-grid');
  if (!grid) return;

  const currentTheme = localStorage.getItem(window.THEME_KEY) || 'midnight';
  grid.innerHTML = '';

  Object.entries(window.OFFICE_THEMES).forEach(([id, theme]) => {
    const card = document.createElement('div');
    card.className = 'theme-card' + (id === currentTheme ? ' active' : '');
    card.dataset.themeId = id;

    const [bg1, bg2, blob1, blob2] = theme.swatch;

    card.innerHTML = `
      <div class="theme-preview" style="background:linear-gradient(135deg,${bg1},${bg2})">
        <div class="tp-blob" style="background:${blob1};opacity:0.7;"></div>
        <div class="tp-blob" style="background:${blob2};opacity:0.6;"></div>
        <div class="tp-blob" style="background:${blob1};opacity:0.35;"></div>
        <div class="theme-check">✓</div>
      </div>
      <div class="theme-info">
        <div class="theme-name">${theme.label}</div>
        <div class="theme-desc">${theme.description}</div>
      </div>
    `;

    card.addEventListener('click', () => {
      window.saveTheme(id);
      renderThemePicker();
      showToast(`Theme: ${theme.label}`);
    });

    grid.appendChild(card);
  });
}

function loadPlaylist() {
  try {
    const raw = localStorage.getItem(PLAYLIST_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {}
  return JSON.parse(JSON.stringify(DEFAULT_PLAYLIST));
}

function savePlaylist(playlist) {
  try {
    localStorage.setItem(PLAYLIST_KEY, JSON.stringify(playlist));
    return true;
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      showToast('Storage full — try using URLs instead of uploaded files.', 'var(--red)');
    } else {
      showToast('Failed to save: ' + e.message, 'var(--red)');
    }
    return false;
  }
}

let playlist = loadPlaylist();

// ── Rendering ─────────────────────────────────────────────────

function typeBadgeClass(type) {
  return { dashboard: 'badge-dashboard', image: 'badge-image', video: 'badge-video', url: 'badge-url' }[type] || 'badge-url';
}

function typeLabel(type) {
  return { dashboard: 'Dashboard', image: 'Image', video: 'Video', url: 'URL' }[type] || type;
}

function renderPlaylist() {
  const list = $('asset-list');
  const meta = $('playlist-meta');

  const active = playlist.filter(isCurrentlyActive).length;
  meta.textContent = `${playlist.length} asset${playlist.length !== 1 ? 's' : ''} · ${active} active now`;

  if (!playlist.length) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📺</div>
        <p>No assets yet. Click <strong>+ Add Asset</strong> to get started.</p>
      </div>`;
    return;
  }

  list.innerHTML = '';
  playlist.forEach((asset, idx) => {
    const row = document.createElement('div');
    row.className = 'asset-row' + (asset.enabled ? '' : ' disabled');
    row.dataset.id = asset.id;
    row.draggable = true;

    const durationLabel = asset.type === 'video' && asset.duration === 0
      ? 'Full video'
      : `${asset.duration}s`;

    const activeNow = isCurrentlyActive(asset);
    const activeDot = activeNow
      ? `<span style="color:var(--accent2);font-size:0.7rem;">● Active</span>`
      : `<span style="color:var(--border);font-size:0.7rem;">○ Inactive</span>`;

    row.innerHTML = `
      <span class="asset-drag-handle" title="Drag to reorder">⠿</span>

      <div class="asset-info">
        <div class="asset-name">${escHtml(asset.name)}</div>
        <div class="asset-meta">
          <span class="badge ${typeBadgeClass(asset.type)}">${typeLabel(asset.type)}</span>
          <span class="asset-duration">⏱ ${durationLabel}</span>
          <span class="asset-schedule-info">📅 ${formatScheduleSummary(asset.schedule)}</span>
          ${activeDot}
        </div>
      </div>

      <div class="asset-actions">
        <label class="toggle-switch" title="${asset.enabled ? 'Enabled' : 'Disabled'}">
          <input type="checkbox" class="asset-toggle" data-id="${asset.id}" ${asset.enabled ? 'checked' : ''} />
          <span class="toggle-track"></span>
        </label>
        <button class="btn btn-ghost btn-sm asset-edit"   data-id="${asset.id}" title="Edit">✏️</button>
        <button class="btn btn-ghost btn-sm asset-move-up"   data-id="${asset.id}" title="Move up"   ${idx === 0 ? 'disabled' : ''}>▲</button>
        <button class="btn btn-ghost btn-sm asset-move-down" data-id="${asset.id}" title="Move down" ${idx === playlist.length - 1 ? 'disabled' : ''}>▼</button>
        <button class="btn btn-danger btn-sm asset-delete" data-id="${asset.id}" title="Delete">✕</button>
      </div>
    `;

    list.appendChild(row);
  });

  attachRowEvents();
  attachDragDrop();
}

function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

// ── Row event delegation ──────────────────────────────────────

function attachRowEvents() {
  const list = $('asset-list');

  list.querySelectorAll('.asset-toggle').forEach(el => {
    el.addEventListener('change', () => {
      const asset = playlist.find(a => a.id === el.dataset.id);
      if (asset) { asset.enabled = el.checked; save(); }
    });
  });

  list.querySelectorAll('.asset-edit').forEach(el => {
    el.addEventListener('click', () => openModal(el.dataset.id));
  });

  list.querySelectorAll('.asset-delete').forEach(el => {
    el.addEventListener('click', () => {
      const asset = playlist.find(a => a.id === el.dataset.id);
      if (!asset) return;
      if (asset.type === 'dashboard' && playlist.filter(a => a.type === 'dashboard').length === 1) {
        showToast('Cannot delete the only dashboard slide.', 'var(--red)');
        return;
      }
      if (confirm(`Delete "${asset.name}"?`)) {
        playlist = playlist.filter(a => a.id !== el.dataset.id);
        save();
      }
    });
  });

  list.querySelectorAll('.asset-move-up').forEach(el => {
    el.addEventListener('click', () => {
      const idx = playlist.findIndex(a => a.id === el.dataset.id);
      if (idx > 0) {
        [playlist[idx - 1], playlist[idx]] = [playlist[idx], playlist[idx - 1]];
        save();
      }
    });
  });

  list.querySelectorAll('.asset-move-down').forEach(el => {
    el.addEventListener('click', () => {
      const idx = playlist.findIndex(a => a.id === el.dataset.id);
      if (idx < playlist.length - 1) {
        [playlist[idx], playlist[idx + 1]] = [playlist[idx + 1], playlist[idx]];
        save();
      }
    });
  });
}

// ── Drag-and-drop reordering ──────────────────────────────────

let dragSrcId = null;

function attachDragDrop() {
  document.querySelectorAll('.asset-row').forEach(row => {
    row.addEventListener('dragstart', e => {
      dragSrcId = row.dataset.id;
      e.dataTransfer.effectAllowed = 'move';
    });
    row.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      document.querySelectorAll('.asset-row').forEach(r => r.classList.remove('drag-over'));
      row.classList.add('drag-over');
    });
    row.addEventListener('dragleave', () => row.classList.remove('drag-over'));
    row.addEventListener('drop', e => {
      e.preventDefault();
      row.classList.remove('drag-over');
      if (!dragSrcId || dragSrcId === row.dataset.id) return;
      const fromIdx = playlist.findIndex(a => a.id === dragSrcId);
      const toIdx   = playlist.findIndex(a => a.id === row.dataset.id);
      if (fromIdx === -1 || toIdx === -1) return;
      const [moved] = playlist.splice(fromIdx, 1);
      playlist.splice(toIdx, 0, moved);
      save();
    });
  });
}

// ── Save & re-render ──────────────────────────────────────────

function save() {
  if (savePlaylist(playlist)) {
    renderPlaylist();
    showToast('Playlist saved ✓');
  }
}

// ── Modal ─────────────────────────────────────────────────────

let editingId = null;

function openModal(id) {
  editingId = id || null;
  const asset = id ? playlist.find(a => a.id === id) : null;

  $('modal-title').textContent = asset ? 'Edit Asset' : 'Add Asset';

  // Populate fields
  $('f-name').value      = asset?.name     ?? '';
  $('f-type').value      = asset?.type     ?? 'image';
  $('f-duration').value  = asset?.duration ?? (window.OFFICE_CONFIG?.defaultSlideDuration ?? 30);
  $('f-src').value       = (asset?.type !== 'dashboard' ? asset?.src : '') ?? '';
  $('f-file').value      = '';
  $('f-start-date').value = asset?.schedule?.startDate ?? '';
  $('f-end-date').value   = asset?.schedule?.endDate   ?? '';
  $('f-start-time').value = asset?.schedule?.startTime ?? '00:00';
  $('f-end-time').value   = asset?.schedule?.endTime   ?? '23:59';

  const dows = asset?.schedule?.daysOfWeek ?? [0,1,2,3,4,5,6];
  document.querySelectorAll('.dow-btn').forEach(btn => {
    btn.classList.toggle('active', dows.includes(Number(btn.dataset.dow)));
  });

  updateTypeFields();
  $('modal-backdrop').classList.remove('hidden');
  $('f-name').focus();
}

function closeModal() {
  $('modal-backdrop').classList.add('hidden');
  editingId = null;
}

function updateTypeFields() {
  const type = $('f-type').value;
  const srcGroup  = $('src-group');
  const fileGroup = $('file-group');
  const srcLabel  = $('src-label');
  const srcHint   = $('src-hint');
  const durationInput = $('f-duration');

  if (type === 'dashboard') {
    srcGroup.classList.add('field-hidden');
    fileGroup.classList.add('field-hidden');
  } else if (type === 'url') {
    srcGroup.classList.remove('field-hidden');
    fileGroup.classList.add('field-hidden');
    srcLabel.textContent = 'Web Page URL';
    srcHint.textContent  = 'Enter the full URL of the page to embed.';
  } else if (type === 'image') {
    srcGroup.classList.remove('field-hidden');
    fileGroup.classList.remove('field-hidden');
    srcLabel.textContent = 'Image URL';
    srcHint.textContent  = 'Direct URL to the image, or upload a file below.';
  } else if (type === 'video') {
    srcGroup.classList.remove('field-hidden');
    fileGroup.classList.remove('field-hidden');
    srcLabel.textContent = 'Video URL';
    srcHint.textContent  = 'Direct URL to the video file, or upload below.';
    if (durationInput.value === '30') durationInput.value = '0';
  }
}

function getActiveDows() {
  return Array.from(document.querySelectorAll('.dow-btn.active'))
    .map(b => Number(b.dataset.dow))
    .sort((a,b) => a - b);
}

function buildSchedule() {
  const startDate = $('f-start-date').value || null;
  const endDate   = $('f-end-date').value   || null;
  const startTime = $('f-start-time').value || '00:00';
  const endTime   = $('f-end-time').value   || '23:59';
  const dows      = getActiveDows();

  // If everything is "always", return null (no schedule object)
  const isAllDays = dows.length === 7;
  const isAllDay  = startTime === '00:00' && endTime === '23:59';
  if (!startDate && !endDate && isAllDays && isAllDay) return null;

  return { startDate, endDate, daysOfWeek: dows, startTime, endTime };
}

async function saveModal() {
  const name     = $('f-name').value.trim();
  const type     = $('f-type').value;
  const duration = parseInt($('f-duration').value, 10);

  if (!name) {
    showToast('Please enter an asset name.', 'var(--red)');
    $('f-name').focus();
    return;
  }

  if (isNaN(duration) || duration < 0) {
    showToast('Invalid duration.', 'var(--red)');
    return;
  }

  let src = $('f-src').value.trim();

  // Handle file upload: convert to data URL
  const fileInput = $('f-file');
  if (fileInput.files.length > 0 && type !== 'url') {
    const file = fileInput.files[0];
    if (file.size > 4 * 1024 * 1024) {
      $('file-size-warning').style.display = 'block';
    }
    src = await readFileAsDataURL(file);
  }

  if (type !== 'dashboard' && !src) {
    showToast('Please provide a URL or upload a file.', 'var(--red)');
    return;
  }

  const schedule = buildSchedule();

  if (editingId) {
    const idx = playlist.findIndex(a => a.id === editingId);
    if (idx !== -1) {
      playlist[idx] = { ...playlist[idx], name, type, src, duration, schedule };
    }
  } else {
    playlist.push({ id: generateId(), name, type, src, duration, enabled: true, schedule });
  }

  closeModal();
  save();
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Wire up events ────────────────────────────────────────────

$('btn-add').addEventListener('click', () => openModal(null));
$('modal-close').addEventListener('click', closeModal);
$('modal-cancel').addEventListener('click', closeModal);
$('modal-backdrop').addEventListener('click', e => { if (e.target === $('modal-backdrop')) closeModal(); });
$('modal-save').addEventListener('click', saveModal);

$('f-type').addEventListener('change', updateTypeFields);

document.querySelectorAll('.dow-btn').forEach(btn => {
  btn.addEventListener('click', () => btn.classList.toggle('active'));
});

$('f-file').addEventListener('change', () => {
  const file = $('f-file').files[0];
  $('file-size-warning').style.display = (file && file.size > 4 * 1024 * 1024) ? 'block' : 'none';
});

// Keyboard: Escape closes modal
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// ── Initial render ────────────────────────────────────────────

renderThemePicker();
renderPlaylist();

// Refresh active status every minute
setInterval(renderPlaylist, 60000);
