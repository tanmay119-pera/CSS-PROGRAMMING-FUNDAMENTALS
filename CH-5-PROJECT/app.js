/**
 * ==============================================================================
 * FRIDAY-FRAMEWORK: THE "ANTI-FRAMEWORK" ADMIN DASHBOARD CONTROLLER
 * ==============================================================================
 * 
 * WHY VANILLA JAVASCRIPT?
 * Zero runtime dependencies, instant execution, and native browser APIs:
 * - `requestAnimationFrame` for buttery-smooth number tickers
 * - Native HTML5 `<dialog>` for modals with built-in accessibility
 * - Event delegation for high-speed table filtering without virtual DOM
 * - Pure CSS custom property manipulation for dynamic states
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('%cfriday-framework%c Indian Cloud Grid • Super Admin: Tanmay', 
    'background: #6366f1; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
    'color: #10b981; font-weight: bold;'
  );

  // Initialize all interactive modules
  initTopLoader();
  initSidebar();
  initMetricCounters();
  initSyncAction();
  initTableFilters();
  initRegionTabs();
  initGlobalSearch();
  initDeployModal();
  initNotificationDropdown();
  initKeyboardShortcuts();
});

/* ==============================================================================
   1. TOP PROGRESS / LOADING BAR MODULE
   ==============================================================================
*/
const TopLoader = {
  element: document.getElementById('top-loader'),
  progress: 0,
  timer: null,

  start() {
    if (!this.element) return;
    this.progress = 12;
    this.element.classList.add('loading');
    this.element.style.width = `${this.progress}%`;

    clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.progress < 85) {
        const step = Math.random() * 14 + 5;
        this.progress = Math.min(85, this.progress + step);
        this.element.style.width = `${this.progress}%`;
      }
    }, 110);
  },

  done() {
    if (!this.element) return;
    clearInterval(this.timer);
    this.progress = 100;
    this.element.style.width = '100%';

    setTimeout(() => {
      this.element.classList.remove('loading');
      setTimeout(() => {
        this.element.style.width = '0%';
        this.progress = 0;
      }, 250);
    }, 200);
  }
};

function initTopLoader() {
  TopLoader.start();
  setTimeout(() => TopLoader.done(), 450);
}

/* ==============================================================================
   2. TOAST NOTIFICATION SYSTEM
   ==============================================================================
*/
const Toast = {
  container: document.getElementById('toast-container'),

  show(message, type = 'info', duration = 3200) {
    if (!this.container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';

    let iconChar = 'ℹ';
    if (type === 'success') iconChar = '✓';
    if (type === 'warning') iconChar = '⚡';

    toast.innerHTML = `
      <div class="toast-icon toast-${type}">${iconChar}</div>
      <div class="toast-message">${message}</div>
    `;

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-hiding');
      toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, duration);
  }
};

/* ==============================================================================
   3. ANIMATED METRIC COUNTERS
   ==============================================================================
*/
function animateCounters() {
  const counterElements = document.querySelectorAll('.counter-value');

  counterElements.forEach(el => {
    const target = parseFloat(el.dataset.target);
    const format = el.dataset.format || 'integer';
    const duration = 850;
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = target * easeProgress;

      if (format === 'decimal') {
        el.textContent = currentVal.toFixed(1);
      } else {
        el.textContent = Math.round(currentVal).toLocaleString();
      }

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        if (format === 'decimal') el.textContent = target.toFixed(1);
        else el.textContent = target.toLocaleString();
      }
    }

    requestAnimationFrame(updateCounter);
  });
}

function initMetricCounters() {
  animateCounters();
}

/* ==============================================================================
   4. SIDEBAR NAVIGATION CONTROLLER
   ==============================================================================
*/
function initSidebar() {
  const layout = document.getElementById('app-layout');
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebar-toggle-btn');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const backdrop = document.getElementById('sidebar-backdrop');
  const navLinks = document.querySelectorAll('.nav-link');
  const breadcrumbCurrent = document.getElementById('current-page-crumb');

  // Desktop Collapse Toggle
  if (toggleBtn && layout) {
    toggleBtn.addEventListener('click', () => {
      layout.classList.toggle('sidebar-is-collapsed');
      const isCollapsed = layout.classList.contains('sidebar-is-collapsed');
      localStorage.setItem('friday_sidebar_collapsed', isCollapsed ? 'true' : 'false');
    });

    if (localStorage.getItem('friday_sidebar_collapsed') === 'true') {
      layout.classList.add('sidebar-is-collapsed');
    }
  }

  // Mobile Drawer Toggle
  if (mobileMenuBtn && sidebar && backdrop) {
    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.add('mobile-open');
      backdrop.classList.add('active');
    });

    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      backdrop.classList.remove('active');
    });
  }

  // Navigation Links
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
      link.closest('.nav-item').classList.add('active');

      const routeName = link.querySelector('.nav-label')?.textContent || 'Database Nodes';
      if (breadcrumbCurrent) {
        breadcrumbCurrent.textContent = routeName;
      }

      if (sidebar) sidebar.classList.remove('mobile-open');
      if (backdrop) backdrop.classList.remove('active');

      Toast.show(`Switched view to ${routeName}`, 'info', 1800);
    });
  });

  const userMenuBtn = document.getElementById('user-menu-btn');
  if (userMenuBtn) {
    userMenuBtn.addEventListener('click', () => {
      Toast.show('Super Admin: Tanmay (Mumbai Grid Root)', 'info', 2500);
    });
  }
}

/* ==============================================================================
   5. SYNC / REFRESH METRICS BUTTON ACTION
   ==============================================================================
*/
function initSyncAction() {
  const syncBtn = document.getElementById('refresh-metrics-btn');
  if (!syncBtn) return;

  syncBtn.addEventListener('click', () => {
    const icon = syncBtn.querySelector('.spin-target');
    if (icon) icon.classList.add('is-spinning');
    syncBtn.disabled = true;

    TopLoader.start();

    setTimeout(() => {
      // Jitter metrics
      const recordsEl = document.querySelector('[data-card="revenue"] .counter-value');
      const qpsEl = document.querySelector('[data-card="conversion"] .counter-value');
      const latencyEl = document.querySelector('[data-card="latency"] .counter-value');

      if (recordsEl) {
        const newRecords = 14298000 + Math.floor(Math.random() * 1200);
        recordsEl.dataset.target = newRecords;
      }
      if (qpsEl) {
        const newQps = 92000 + Math.floor(Math.random() * 850);
        qpsEl.dataset.target = newQps;
      }
      if (latencyEl) {
        const newLat = (3.4 + Math.random() * 0.8).toFixed(1);
        latencyEl.dataset.target = newLat;
      }

      animateCounters();

      TopLoader.done();
      if (icon) icon.classList.remove('is-spinning');
      syncBtn.disabled = false;

      Toast.show('Database cluster telemetry synced across 4 regions', 'success', 2800);
    }, 650);
  });
}

/* ==============================================================================
   6. TABLE FILTERING (Status Tabs: All, Primary, Replica, Syncing)
   ==============================================================================
*/
function initTableFilters() {
  const filterPills = document.querySelectorAll('.filter-pill');
  const tableRows = document.querySelectorAll('#table-body tr');
  const emptyState = document.getElementById('table-empty-state');

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const selectedFilter = pill.dataset.filter;
      let visibleCount = 0;

      tableRows.forEach(row => {
        const rowStatus = row.dataset.status;
        const matches = (selectedFilter === 'all' || rowStatus === selectedFilter);

        if (matches) {
          row.style.display = '';
          visibleCount++;
        } else {
          row.style.display = 'none';
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('hidden', visibleCount > 0);
      }
    });
  });
}

/* ==============================================================================
   7. REGION SELECTOR TABS (Mumbai, Bengaluru, Delhi, All)
   ==============================================================================
*/
function initRegionTabs() {
  const regionTabs = document.querySelectorAll('.time-tab');
  const tableRows = document.querySelectorAll('#table-body tr');

  regionTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      regionTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const regionKey = tab.dataset.period;
      let count = 0;

      tableRows.forEach(row => {
        const rowText = row.textContent.toLowerCase();
        let matches = true;

        if (regionKey === 'mumbai') matches = rowText.includes('mumbai');
        else if (regionKey === 'blr') matches = rowText.includes('bengaluru');
        else if (regionKey === 'delhi') matches = rowText.includes('delhi') || rowText.includes('noida');

        if (matches) {
          row.style.display = '';
          count++;
        } else {
          row.style.display = 'none';
        }
      });

      Toast.show(`Filtered by region: ${tab.textContent} (${count} active shards)`, 'info', 1800);
    });
  });
}

/* ==============================================================================
   8. REAL-TIME SEARCH (Indian Names, Shards, Engines, Datacenters)
   ==============================================================================
*/
function initGlobalSearch() {
  const searchInput = document.getElementById('global-search-input');
  const tableRows = document.querySelectorAll('#table-body tr');
  const emptyState = document.getElementById('table-empty-state');

  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    let visibleCount = 0;

    tableRows.forEach(row => {
      const rowText = row.textContent.toLowerCase();
      const matches = rowText.includes(query);

      if (matches) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('hidden', visibleCount > 0);
    }
  });
}

/* ==============================================================================
   9. PROVISION NEW NODE MODAL (<dialog>)
   ==============================================================================
*/
function initDeployModal() {
  const modal = document.getElementById('deploy-modal');
  const openBtn = document.getElementById('open-deploy-modal-btn');
  const closeBtn = document.getElementById('close-modal-btn');
  const cancelBtn = document.getElementById('cancel-deploy-btn');
  const form = document.getElementById('deploy-form');
  const tableBody = document.getElementById('table-body');

  if (!modal) return;

  if (openBtn) {
    openBtn.addEventListener('click', () => modal.showModal());
  }

  const closeModal = () => modal.close();
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.close();
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const shardName = document.getElementById('deploy-service').value;
      const engine = document.getElementById('deploy-engine').value;
      const engineer = document.getElementById('deploy-engineer').value;
      const region = document.getElementById('deploy-env').value;

      modal.close();
      TopLoader.start();

      setTimeout(() => {
        TopLoader.done();

        // Initials for avatar
        const initials = engineer.split(' ').map(n => n[0]).join('').substring(0, 2);

        if (tableBody) {
          const newRow = document.createElement('tr');
          newRow.dataset.status = 'primary';
          newRow.className = 'db-row';
          newRow.innerHTML = `
            <td>
              <div class="resource-cell">
                <div class="resource-icon icon-emerald">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
                </div>
                <div>
                  <div class="resource-name">${shardName}</div>
                  <div class="resource-id">shard-id: #in-${Math.floor(100 + Math.random() * 900)}</div>
                </div>
              </div>
            </td>
            <td><span class="engine-badge engine-postgres">${engine}</span></td>
            <td>
              <div class="engineer-tag">
                <span class="engineer-avatar avatar-as">${initials}</span>
                <span class="engineer-name">${engineer}</span>
              </div>
            </td>
            <td><span class="region-pill">${region}</span></td>
            <td><span class="status-pill status-success"><span class="dot animate-pulse"></span>Provisioned</span></td>
            <td>
              <div class="table-storage-bar">
                <div class="storage-meta"><span>12 GB / 1 TB</span><span>1%</span></div>
                <div class="progress-track"><div class="progress-fill fill-emerald" style="width: 1%;"></div></div>
              </div>
            </td>
            <td><span class="mono-text latency-fast">1.2ms</span></td>
            <td class="text-right">
              <button class="table-action-btn btn-action-glow" onclick="queryNode('${shardName}')">Query</button>
            </td>
          `;
          tableBody.prepend(newRow);
        }

        form.reset();
        Toast.show(`Database shard ${shardName} assigned to ${engineer} in ${region}!`, 'success', 3800);
      }, 750);
    });
  }
}

/* ==============================================================================
   10. NOTIFICATIONS DROPDOWN
   ==============================================================================
*/
function initNotificationDropdown() {
  const notifBtn = document.getElementById('notifications-btn');
  const notifDropdown = document.getElementById('notifications-dropdown');
  const clearBtn = document.getElementById('mark-read-btn');
  const badge = document.getElementById('notif-badge');

  if (!notifBtn || !notifDropdown) return;

  notifBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    notifDropdown.classList.toggle('active');
  });

  document.addEventListener('click', (e) => {
    if (!notifDropdown.contains(e.target) && e.target !== notifBtn) {
      notifDropdown.classList.remove('active');
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      document.querySelectorAll('.notif-item.unread').forEach(item => {
        item.classList.remove('unread');
      });
      if (badge) badge.style.display = 'none';
      Toast.show('All notifications cleared', 'info', 2000);
    });
  }
}

/* ==============================================================================
   11. KEYBOARD SHORTCUTS
   ==============================================================================
*/
function initKeyboardShortcuts() {
  const searchInput = document.getElementById('global-search-input');
  const toggleBtn = document.getElementById('sidebar-toggle-btn');

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      searchInput?.focus();
    }
    if (e.ctrlKey && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      toggleBtn?.click();
    }
  });
}

/* ==============================================================================
   12. GLOBAL TABLE ROW ACTIONS
   ==============================================================================
*/
window.queryNode = function(nodeName) {
  TopLoader.start();
  setTimeout(() => {
    TopLoader.done();
    Toast.show(`Connected SQL Console to ${nodeName} (Response: 200 OK)`, 'success', 2600);
  }, 350);
};

window.syncShard = function(nodeName) {
  TopLoader.start();
  Toast.show(`Initiating WAL catchup for ${nodeName}...`, 'warning', 2200);

  setTimeout(() => {
    TopLoader.done();
    const rows = document.querySelectorAll('#table-body tr');
    rows.forEach(row => {
      if (row.textContent.includes(nodeName)) {
        row.dataset.status = 'replica';
        const pill = row.querySelector('.status-pill');
        if (pill) {
          pill.className = 'status-pill status-replica';
          pill.innerHTML = '<span class="dot"></span>Replica (Synced)';
        }
        const latency = row.querySelector('.latency-warn');
        if (latency) {
          latency.className = 'mono-text latency-fast';
          latency.textContent = '3.1ms';
        }
        const actionBtn = row.querySelector('.btn-retry');
        if (actionBtn) {
          actionBtn.className = 'table-action-btn';
          actionBtn.textContent = 'Metrics';
          actionBtn.onclick = () => queryNode(nodeName);
        }
      }
    });
    Toast.show(`Shard ${nodeName} fully synchronized!`, 'success', 3200);
  }, 1100);
};
