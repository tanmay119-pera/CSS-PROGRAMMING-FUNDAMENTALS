/* =====================================================================
   PULSE DASHBOARD — BEHAVIOUR
   =====================================================================
   Everything here follows the same shape:
     1. grab the element(s) we care about
     2. listen for an event
     3. flip a class / attribute
     4. let the CSS we already wrote handle how that LOOKS

   JS's job in this project is small on purpose — it toggles state,
   it doesn't reimplement styling. That split (JS = state, CSS = look)
   is the core idea behind the "you don't need a framework" argument.

   We wrap everything in a DOMContentLoaded listener so we never try to
   grab an element before the browser has actually parsed it into the
   page.
===================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ===================================================================
     1. THEME TOGGLE (light / dark) — with localStorage persistence
     =================================================================== */

  const html = document.documentElement; // the <html> tag — this is where data-theme lives
  const themeToggleBtn = document.getElementById('themeToggle');

  // On page load, decide which theme to start in:
  //   a) if the user picked one before, localStorage remembers it
  //   b) otherwise, fall back to whatever their OS/browser prefers
  const savedTheme = localStorage.getItem('pulse-theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme) {
    html.setAttribute('data-theme', savedTheme);
  } else if (systemPrefersDark) {
    html.setAttribute('data-theme', 'dark');
  }
  // If neither applies, we just keep the default data-theme="light" that's
  // already written directly in index.html — no JS needed for that case.

  function applyThemeButtonLabel() {
    const isDark = html.getAttribute('data-theme') === 'dark';
    // Keeping the accessible label in sync with what clicking the button
    // will actually DO next — this matters for screen reader users.
    themeToggleBtn.setAttribute(
      'aria-label',
      isDark ? 'Switch to light mode' : 'Switch to dark mode'
    );
  }
  applyThemeButtonLabel();

  themeToggleBtn.addEventListener('click', () => {
    const isDark = html.getAttribute('data-theme') === 'dark';
    const nextTheme = isDark ? 'light' : 'dark';

    html.setAttribute('data-theme', nextTheme);
    localStorage.setItem('pulse-theme', nextTheme); // remember the choice for next visit
    applyThemeButtonLabel();
  });


  /* ===================================================================
     2. MOBILE SIDEBAR (hamburger menu + backdrop overlay)
     =================================================================== */

  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  const menuToggleBtn = document.getElementById('menuToggle');

  function openSidebar() {
    sidebar.classList.add('is-open');
    overlay.classList.add('is-visible');
    // aria-expanded tells assistive tech whether the thing this button
    // controls is currently open — screen readers announce this.
    menuToggleBtn.setAttribute('aria-expanded', 'true');
  }

  function closeSidebar() {
    sidebar.classList.remove('is-open');
    overlay.classList.remove('is-visible');
    menuToggleBtn.setAttribute('aria-expanded', 'false');
  }

  menuToggleBtn.addEventListener('click', openSidebar);

  // Tapping the dark backdrop is the expected way to dismiss an overlay panel
  overlay.addEventListener('click', closeSidebar);

  // If someone opens the sidebar on their phone, then rotates it or the
  // window otherwise grows past our "mobile" breakpoint, force-close the
  // off-canvas panel so it doesn't get stuck open awkwardly on desktop.
  window.addEventListener('resize', () => {
    if (window.innerWidth > 720) {
      closeSidebar();
    }
  });


  /* ===================================================================
     3. SIDEBAR NAVIGATION — clicking a link marks it active + retitles the page
     =================================================================== */

  const navLinks = document.querySelectorAll('.nav-link');
  const pageTitle = document.getElementById('pageTitle');

  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault(); // these are placeholder "#" links, so stop the page from jumping to the top

      // Remove "is-active" from whichever link currently has it...
      navLinks.forEach((otherLink) => otherLink.classList.remove('is-active'));
      // ...then add it to the one that was just clicked.
      link.classList.add('is-active');

      // The link's data-page attribute (set in the HTML) tells us what
      // to put in the topbar title — a tiny "single page app" feel
      // without any actual routing library.
      pageTitle.textContent = link.dataset.page;

      // On mobile, picking a page should also close the off-canvas menu
      closeSidebar();
    });
  });


  /* ===================================================================
     4. AVATAR DROPDOWN MENU
     =================================================================== */

  const avatarBtn = document.getElementById('avatarBtn');
  const avatarDropdown = document.getElementById('avatarDropdown');

  function toggleAvatarMenu(forceState) {
    // forceState lets us explicitly say "open" or "closed" when needed;
    // if it's not passed, we just flip whatever the current state is.
    const isOpen = avatarDropdown.classList.toggle('is-open', forceState);
    avatarBtn.setAttribute('aria-expanded', String(isOpen));
  }

  avatarBtn.addEventListener('click', (event) => {
    event.stopPropagation(); // stop this click from also triggering the "click outside" listener below
    toggleAvatarMenu();
  });

  // Clicking ANYWHERE else on the page should close the dropdown if it's open.
  // This "click outside to close" pattern is extremely common in real UIs.
  document.addEventListener('click', (event) => {
    const clickedInsideDropdown = avatarDropdown.contains(event.target);
    if (!clickedInsideDropdown) {
      toggleAvatarMenu(false);
    }
  });

  // Pressing Escape should also close it — good keyboard-accessibility practice
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      toggleAvatarMenu(false);
      closeSidebar();
    }
  });


  /* ===================================================================
     5. METRIC COUNT-UP ANIMATION
     Instead of the numbers just appearing, they count up from 0 to their
     real value. This uses requestAnimationFrame, which asks the browser
     "call me right before your next repaint" — the smoothest way to
     drive an animation in plain JS (much smoother than setInterval).
     =================================================================== */

  const metricValues = document.querySelectorAll('.metric-card__value');
  const ANIMATION_DURATION_MS = 1200;

  metricValues.forEach((el) => {
    // Every piece of data the animation needs comes from data-* attributes
    // set directly in the HTML — that keeps the HTML/JS cleanly connected
    // without hardcoding numbers inside script.js itself.
    const target = parseFloat(el.dataset.target);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const decimals = parseInt(el.dataset.decimals || '0', 10);

    let startTime = null;

    function step(timestamp) {
      if (startTime === null) startTime = timestamp;

      const elapsed = timestamp - startTime;
      // progress goes from 0 -> 1 over the animation's duration; clamped
      // at 1 so it never overshoots the target value.
      const progress = Math.min(elapsed / ANIMATION_DURATION_MS, 1);

      // easeOutQuad: starts fast, settles gently into place, rather than
      // a robotic straight-line count. A small touch that reads as "smooth".
      const eased = 1 - (1 - progress) * (1 - progress);

      const currentValue = target * eased;
      el.textContent = `${prefix}${currentValue.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(step); // keep going until we reach progress === 1
      }
    }

    requestAnimationFrame(step);
  });


  /* ===================================================================
     6. TOP-PRODUCTS BAR FILL ANIMATION
     The bars start at width: 0 (set in CSS). We read each one's real
     target width from data-width and apply it here — because CSS
     transitions only animate a CHANGE in value, not a value that's
     correct from the very first frame.
     =================================================================== */

  const barFills = document.querySelectorAll('.bar-fill');

  // A short delay lets the page finish its initial paint first, so the
  // fill animation is clearly visible rather than happening instantly
  // before the user's eyes have even landed on the panel.
  setTimeout(() => {
    barFills.forEach((bar) => {
      bar.style.width = `${bar.dataset.width}%`;
    });
  }, 200);

});