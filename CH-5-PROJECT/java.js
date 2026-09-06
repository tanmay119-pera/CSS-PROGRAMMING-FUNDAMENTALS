/**
 * ==============================================================================
 * FRIDAY-FRAMEWORK: THE "ANTI-FRAMEWORK" ADMIN DASHBOARD CONTROLLER
 * ==============================================================================
 * 
 * WHY VANILLA JAVASCRIPT?
 * Many modern web developers believe you need React, Vue, or complex state
 * stores just to build interactive dashboards.
 * 
 * In reality, modern Vanilla JavaScript (ES6+) provides:
 * 1. Native DOM APIs (querySelector, classList, dataset) that are blazing fast.
 * 2. The HTML5 <dialog> API with native accessibility and modal control.
 * 3. `requestAnimationFrame` for buttery-smooth 60fps animations.
 * 4. Zero runtime overhead (0kb download, instant first-contentful-paint).
 * 
 * This file is thoroughly commented for beginners to learn clean, modular,
 * production-ready vanilla JavaScript patterns.
 * ==============================================================================
 */

// Run our scripts once the HTML document structure is fully parsed and ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('%cfriday-framework%c v2.4 initialized. Zero frameworks. Pure velocity.', 
    'background: #6366f1; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
    'color: #10b981; font-weight: bold;'
  );

  // Initialize all interactive modules
  initTopLoader();
  initSidebar();
  initMetricCounters();
  initSyncAction();
  initTableFilters();
  initGlobalSearch();
  initDeployModal();
  initNotificationDropdown();
  initTelemetryActions();
  initKeyboardShortcuts();
});

/* ==============================================================================
   1. TOP PROGRESS / LOADING BAR MODULE
   ==============================================================================
   Simulates network requests (similar to YouTube / GitHub top loading bar).
   Manipulates CSS width and opacity directly on `#top-loader`.
*/
const TopLoader = {
  element: document.getElementById('top-loader'),
  progress: 0,
  timer: null,

  /**
   * Starts or restarts the progress bar animation
   */
  start() {
    if (!this.element) return;
    this.progress = 10;
    this.element.classList.add('loading');
    this.element.style.width = `${this.progress}%`;

    // Incrementally crawl forward to simulate async activity
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.progress < 85) {
        // Slow down as we get closer to 85%
        const step = Math.random() * 12 + 4;
        this.progress = Math.min(85, this.progress + step);
        this.element.style.width = `${this.progress}%`;
      }
    }, 120);
  },

  /**
   * Completes the progress bar by animating to 100% and fading out
   */
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
  // Trigger initial smooth page load simulation
  TopLoader.start();
  setTimeout(() => TopLoader.done(), 450);
}

/* ==============================================================================
   2. TOAST NOTIFICATION SYSTEM
   ==============================================================================
   Creates dynamic notification cards that pop up in the bottom right corner.
*/
const Toast = {
  container: document.getElementById('toast-container'),

  /**
   * @param {string} message - Text to display
   * @param {'success'|'info'|'warning'} type - Visual color style
   * @param {number} duration - Milliseconds before auto-dismissing
   */
  show(message, type = 'info', duration = 3200) {
    if (!this.container) return;

    // Create toast DOM node
    const toast = document.createElement('div');
    toast.className = 'toast';

    // Pick icon based on message type
    let iconChar = 'ℹ';
    if (type === 'success') iconChar = '✓';
    if (type === 'warning') iconChar = '⚡';

    toast.innerHTML = `
      <div class="toast-icon toast-${type}">${iconChar}</div>
      <div class="toast-message">${message}</div>
    `;

    this.container.appendChild(toast);

    // Auto-remove after duration with smooth exit transition
    setTimeout(() => {
      toast.classList.add('toast-hiding');
      toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, duration);
  }
};

/* ==============================================================================
   3. ANIMATED METRIC COUNTERS
   ==============================================================================
   Uses `requestAnimationFrame` to smoothly roll numbers from 0 up to target.
   This provides high-end motion without loading bulky 3rd-party counter packages.
*/
function animateCounters() {
  const counterElements = document.querySelectorAll('.counter-value');

  counterElements.forEach(el => {
    const target = parseFloat(el.dataset.target);
    const format = el.dataset.format || 'integer';
    const duration = 900; // Animation duration in ms
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function: easeOutCubic (starts fast, glides to a stop)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = target * easeProgress;

      // Format based on type (Currency, Integer, Decimal)
      if (format === 'currency') {
        el.textContent = Math.round(currentVal).toLocaleString();
      } else if (format === 'decimal') {
        el.textContent = currentVal.toFixed(2);
      } else {
        el.textContent = Math.round(currentVal).toLocaleString();
      }

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        // Ensure final exact precision
        if (format === 'decimal') el.textContent = target.toFixed(2);
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
   Handles desktop collapse/expand, mobile drawer, and active route switching.
*/
function initSidebar() {
  const layout = document.getElementById('app-layout');
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebar-toggle-btn');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const backdrop = document.getElementById('sidebar-backdrop');
  const navLinks = document.querySelectorAll('.nav-link');
  const breadcrumbCurrent = document.getElementById('current-page-crumb');

  // 1. Desktop Collapse Toggle
  if (toggleBtn && layout) {
    toggleBtn.addEventListener('click', () => {
      layout.classList.toggle('sidebar-is-collapsed');
      const isCollapsed = layout.classList.contains('sidebar-is-collapsed');
      localStorage.setItem('friday_sidebar_collapsed', isCollapsed ? 'true' : 'false');
    });

    // Restore user preference from localStorage
    if (localStorage.getItem('friday_sidebar_collapsed') === 'true') {
      layout.classList.add('sidebar-is-collapsed');
    }
  }

  // 2. Mobile Drawer Open/Close
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

  // 3. Navigation Route Switching
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      // Remove active from all items, assign to clicked
      document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
      link.closest('.nav-item').classList.add('active');

      const routeName = link.querySelector('.nav-label')?.textContent || 'Overview';
      if (breadcrumbCurrent) {
        breadcrumbCurrent.textContent = routeName;
      }

      // Close mobile drawer if open
      if (sidebar) sidebar.classList.remove('mobile-open');
      if (backdrop) backdrop.classList.remove('active');

      // Feedback toast
      Toast.show(`Navigated to ${routeName}`, 'info', 1800);
    });
  });

  // User Profile Quick Action
  const userMenuBtn = document.getElementById('user-menu-btn');
  if (userMenuBtn) {
    userMenuBtn.addEventListener('click', () => {
      Toast.show('Tanmay (Super Admin): Logged in via 2FA', 'info', 2500);
    });
  }
}

/* ==============================================================================
   5. SYNC / REFRESH METRICS BUTTON ACTION
   ==============================================================================
   Demonstrates responsive state feedback:
   - Starts top loader
   - Spins the refresh SVG icon
   - Adds slight realistic random jitter to stats
   - Re-runs counter animations
   - Dispatches a success toast
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
      // Generate slight realistic random fluctuation
      const revenueEl = document.querySelector('[data-card="revenue"] .counter-value');
      const sessionsEl = document.querySelector('[data-card="sessions"] .counter-value');
      const latencyEl = document.querySelector('[data-card="latency"] .counter-value');
      const convEl = document.querySelector('[data-card="conversion"] .counter-value');

      if (revenueEl) {
        const newRev = 148000 + Math.floor(Math.random() * 950);
        revenueEl.dataset.target = newRev;
      }
      if (sessionsEl) {
        const newSessions = 28300 + Math.floor(Math.random() * 400);
        sessionsEl.dataset.target = newSessions;
      }
      if (latencyEl) {
        const newLatency = 38 + Math.floor(Math.random() * 8);
        latencyEl.dataset.target = newLatency;
      }
      if (convEl) {
        const newConv = (4.75 + Math.random() * 0.25).toFixed(2);
        convEl.dataset.target = newConv;
      }

      // Re-trigger counter animation
      animateCounters();

      // Slightly randomize telemetry bars
      const cpuStat = document.getElementById('cpu-stat');
      if (cpuStat) {
        const newCpu = (22 + Math.random() * 7).toFixed(1);
        cpuStat.textContent = `${newCpu}%`;
        const fill = cpuStat.closest('.telemetry-item').querySelector('.progress-fill');
        if (fill) fill.style.width = `${newCpu}%`;
      }

      // Complete loading state
      TopLoader.done();
      if (icon) icon.classList.remove('is-spinning');
      syncBtn.disabled = false;

      Toast.show('Metrics synchronized with 4 edge clusters', 'success', 2800);
    }, 650);
  });
}

/* ==============================================================================
   6. TABLE FILTERING (STATUS TABS: All, Success, Pending, Failed)
   ==============================================================================
   Filters HTML table rows purely using DOM traversal and dataset attributes.
*/
function initTableFilters() {
  const filterPills = document.querySelectorAll('.filter-pill');
  const tableRows = document.querySelectorAll('#table-body tr');
  const emptyState = document.getElementById('table-empty-state');

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      // Toggle active class
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const selectedFilter = pill.dataset.filter;
      let visibleCount = 0;

      tableRows.forEach(row => {
        const rowStatus = row.dataset.status;
        const matchesFilter = (selectedFilter === 'all' || rowStatus === selectedFilter);

        if (matchesFilter) {
          row.style.display = '';
          row.style.opacity = '1';
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
   7. GLOBAL REAL-TIME SEARCH (TABLE & LOGS FILTER)
   ==============================================================================
   Live filters table content as the user types, with debounce for performance.
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
   8. NATIVE HTML5 <dialog> MODAL (NEW DEPLOYMENT)
   ==============================================================================
   The <dialog> element provides built-in focus trapping, Escape key closing,
   and accessible backdrop blurring with `.showModal()`.
*/
function initDeployModal() {
  const modal = document.getElementById('deploy-modal');
  const openBtn = document.getElementById('open-deploy-modal-btn');
  const closeBtn = document.getElementById('close-modal-btn');
  const cancelBtn = document.getElementById('cancel-deploy-btn');
  const form = document.getElementById('deploy-form');
  const tableBody = document.getElementById('table-body');

  if (!modal) return;

  // Open modal using native browser API
  if (openBtn) {
    openBtn.addEventListener('click', () => {
      modal.showModal();
    });
  }

  // Close handlers
  const closeModal = () => modal.close();
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  // Close when clicking the outer backdrop
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.close();
    }
  });

  // Handle Form Submission
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const service = document.getElementById('deploy-service').value;
      const env = document.getElementById('deploy-env').value;
      const notes = document.getElementById('deploy-notes').value || 'Production release';

      modal.close();
      TopLoader.start();

      setTimeout(() => {
        TopLoader.done();

        // Dynamically prepend new row to activity table
        if (tableBody) {
          const newRow = document.createElement('tr');
          newRow.dataset.status = 'success';
          newRow.innerHTML = `
            <td>
              <div class="resource-cell">
                <div class="resource-icon icon-emerald">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <div>
                  <div class="resource-name">${service}</div>
                  <div class="resource-id">${notes.substring(0, 24)}</div>
                </div>
              </div>
            </td>
            <td><span class="type-tag">${env}</span></td>
            <td><span class="initiator-badge">tanmay</span></td>
            <td><span class="status-pill status-success"><span class="dot"></span>Success</span></td>
            <td><span class="mono-text">18s</span></td>
            <td><span class="sub-text">Just now</span></td>
            <td class="text-right">
              <button class="table-action-btn" onclick="viewLog('${service}')">Details</button>
            </td>
          `;
          tableBody.prepend(newRow);
        }

        form.reset();
        Toast.show(`Successfully triggered ${service} deployment to ${env}!`, 'success', 3500);
      }, 800);
    });
  }
}

/* ==============================================================================
   9. NOTIFICATIONS DROPDOWN
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

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!notifDropdown.contains(e.target) && e.target !== notifBtn) {
      notifDropdown.classList.remove('active');
    }
  });

  // Mark all read button
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      document.querySelectorAll('.notif-item.unread').forEach(item => {
        item.classList.remove('unread');
      });
      if (badge) badge.style.display = 'none';
      Toast.show('All notifications marked as read', 'info', 2000);
    });
  }
}

/* ==============================================================================
   10. TELEMETRY PANEL ACTIONS
   ==============================================================================
   "Purge Cache" & "Run Healthcheck" buttons inside the telemetry card.
*/
function initTelemetryActions() {
  const btnPurge = document.getElementById('btn-purge-cache');
  const btnDiag = document.getElementById('btn-run-diagnostics');

  if (btnPurge) {
    btnPurge.addEventListener('click', () => {
      TopLoader.start();
      btnPurge.disabled = true;

      setTimeout(() => {
        TopLoader.done();
        btnPurge.disabled = false;
        Toast.show('Global Edge CDN Cache invalidated across 300+ PoPs', 'success', 3000);
      }, 700);
    });
  }

  if (btnDiag) {
    btnDiag.addEventListener('click', () => {
      TopLoader.start();
      btnDiag.disabled = true;

      setTimeout(() => {
        TopLoader.done();
        btnDiag.disabled = false;
        Toast.show('Diagnostics complete: 8/8 services healthy (0 packet drops)', 'success', 3000);
      }, 900);
    });
  }
}

/* ==============================================================================
   11. KEYBOARD SHORTCUTS
   ==============================================================================
   - ⌘K or Ctrl+K: Focus search input
   - Ctrl+B: Toggle sidebar collapse
*/
function initKeyboardShortcuts() {
  const searchInput = document.getElementById('global-search-input');
  const toggleBtn = document.getElementById('sidebar-toggle-btn');

  document.addEventListener('keydown', (e) => {
    // Focus search on Ctrl+K / Cmd+K
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      searchInput?.focus();
    }

    // Toggle sidebar on Ctrl+B
    if (e.ctrlKey && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      toggleBtn?.click();
    }
  });
}

/* ==============================================================================
   12. TABLE ROW GLOBAL ACTIONS
   ==============================================================================
   Attached globally for inline onclick handlers in table rows.
*/
window.viewLog = function(ref) {
  Toast.show(`Viewing full audit trail for resource: ${ref}`, 'info', 2400);
};

window.retryJob = function(workerId) {
  TopLoader.start();
  Toast.show(`Re-spawning worker process for ${workerId}...`, 'warning', 2000);

  setTimeout(() => {
    TopLoader.done();
    const row = document.querySelector(`tr[data-status="failed"]`);
    if (row) {
      row.dataset.status = 'success';
      const statusPill = row.querySelector('.status-pill');
      if (statusPill) {
        statusPill.className = 'status-pill status-success';
        statusPill.innerHTML = '<span class="dot"></span>Recovered';
      }
      const icon = row.querySelector('.resource-icon');
      if (icon) {
        icon.className = 'resource-icon icon-emerald';
        icon.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';
      }
      const actionBtn = row.querySelector('.btn-retry');
      if (actionBtn) {
        actionBtn.className = 'table-action-btn';
        actionBtn.textContent = 'Details';
        actionBtn.onclick = () => viewLog(workerId);
      }
    }
    Toast.show(`Job on ${workerId} completed successfully!`, 'success', 3000);
  }, 1200);
};
