let allPkgs = []

// ── Tabs ──────────────────────────────────────────────────────────────────────

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'))
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'))
    btn.classList.add('active')
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active')
    if (btn.dataset.tab === 'packages') loadPkgs()
  })
})

// ── Settings ──────────────────────────────────────────────────────────────────

async function loadConfig() {
  const c = await api('/api/config')
  if (!c) return
  document.getElementById('ps4ip').value      = c.ps4ip      || ''
  document.getElementById('ps4port').value    = c.ps4port    || '12800'
  document.getElementById('pkgBasePath').value = c.pkgBasePath || ''
}

async function saveConfig() {
  const body = {
    ps4ip:       document.getElementById('ps4ip').value.trim(),
    ps4port:     document.getElementById('ps4port').value.trim() || '12800',
    pkgBasePath: document.getElementById('pkgBasePath').value.trim(),
  }
  const d = await api('/api/config', { method: 'POST', body })
  toast(d?.success ? 'Configuration saved.' : 'Failed to save.', d?.success ? 'ok' : 'fail')
}

document.getElementById('btn-save').addEventListener('click', saveConfig)

// ── Network IPs ───────────────────────────────────────────────────────────────

async function loadNetworkIPs() {
  const d = await api('/api/network')
  if (!d) return

  const el = document.getElementById('ip-list')
  el.innerHTML = d.ips.length
    ? d.ips.map(ip => `<span class="ip-chip">${ip}</span>`).join('')
    : '<span style="font-size:12px;color:var(--sub)">None found</span>'

  document.getElementById('server-info').textContent =
    d.ips[0] ? `${d.ips[0]}:3000` : 'localhost:3000'
}

// ── Packages ──────────────────────────────────────────────────────────────────

async function loadPkgs() {
  const container = document.getElementById('pkg-list-container')
  const count     = document.getElementById('pkg-count')

  container.innerHTML = '<div class="empty"><span class="spin"></span></div>'
  count.textContent   = ''

  const d = await api('/api/pkgs')

  if (!d || d.error) {
    container.innerHTML = empty(d?.error || 'Connection error', 'Check your PKG base path in Settings')
    allPkgs = []
    return
  }

  allPkgs = d.pkgs
  count.textContent = countLabel(allPkgs.length, allPkgs.length)
  renderPkgs(allPkgs)
}

function filterPkgs() {
  const q        = document.getElementById('pkg-search').value.toLowerCase()
  const filtered = q
    ? allPkgs.filter(p => p.name.toLowerCase().includes(q) || p.relativePath.toLowerCase().includes(q))
    : allPkgs

  document.getElementById('pkg-count').textContent = q
    ? `${filtered.length} / ${allPkgs.length}`
    : countLabel(allPkgs.length, allPkgs.length)

  renderPkgs(filtered)
}

function renderPkgs(pkgs) {
  const container = document.getElementById('pkg-list-container')

  if (!pkgs.length) {
    container.innerHTML = empty('No matches')
    return
  }

  const rows = pkgs.map((pkg, i) => `
    <tr>
      <td>
        <div class="pkg-name">${esc(pkg.name)}</div>
        ${pkg.relativePath !== pkg.name ? `<div class="pkg-sub">${esc(pkg.relativePath)}</div>` : ''}
      </td>
      <td class="pkg-size">${pkg.sizeFormatted}</td>
      <td class="pkg-action">
        <button class="btn btn-send" id="sb-${i}" data-path="${esc(pkg.path)}">Send</button>
      </td>
    </tr>
  `).join('')

  container.innerHTML = `
    <table>
      <thead><tr>
        <th>Package</th>
        <th class="r">Size</th>
        <th class="r">Action</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`

  pkgs.forEach((pkg, i) => {
    document.getElementById(`sb-${i}`).addEventListener('click', () => sendPkg(pkg.path, i))
  })
}

async function sendPkg(pkgPath, i) {
  const btn = document.getElementById(`sb-${i}`)
  btn.disabled  = true
  btn.className = 'btn btn-send sending'
  btn.textContent = 'Sending...'

  const d = await api('/api/send', { method: 'POST', body: { pkgPath } })

  if (d?.success) {
    btn.className   = 'btn btn-send ok'
    btn.textContent = 'Queued'
    toast('Install queued on PS4.', 'ok')
  } else {
    btn.className   = 'btn btn-send fail'
    btn.textContent = 'Failed'
    toast('Error: ' + (d?.error || 'Unknown error'), 'fail')
  }

  setTimeout(() => {
    btn.className   = 'btn btn-send'
    btn.textContent = 'Send'
    btn.disabled    = false
  }, 3000)
}

document.getElementById('btn-refresh').addEventListener('click', loadPkgs)
document.getElementById('pkg-search').addEventListener('input', filterPkgs)

// ── Helpers ───────────────────────────────────────────────────────────────────

async function api(url, { method = 'GET', body } = {}) {
  try {
    const r = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body:    body ? JSON.stringify(body) : undefined,
    })
    return r.json()
  } catch (e) {
    toast('Network error: ' + e.message, 'fail')
    return null
  }
}

let _tt
function toast(msg, type = 'info') {
  const el = document.getElementById('toast')
  el.textContent = msg
  el.className   = type
  el.style.display = 'block'
  clearTimeout(_tt)
  _tt = setTimeout(() => el.style.display = 'none', 4200)
}

const empty = (title, hint = '') =>
  `<div class="empty"><div class="empty-title">${title}</div>${hint ? `<div class="empty-hint">${hint}</div>` : ''}</div>`

const countLabel = (n) => `${n} file${n !== 1 ? 's' : ''}`

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// ── Init ──────────────────────────────────────────────────────────────────────

loadConfig()
loadNetworkIPs()