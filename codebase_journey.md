# ⚡ Cyberpunk Portfolio & Storefront: Code Path Journey

This document maps out all logical execution flows, function linkages, and event cycles across your website assets. You can use this as a reference guide directly inside VS Code to understand how your portfolio page and storefront interact.

---

## 🗺️ System Architecture Overview

```mermaid
graph TD
    %% Base Files
    index[index.html] --> style[style.css]
    index --> script[script.js]
    
    store[store.html] --> store_css[store.css]
    store --> store_js[store.js]
    store_js --> db[(products.json)]

    %% Script Flows
    subgraph script.js [Portfolio Page Controller]
        init_particles[Initialize Particle Canvas]
        boot_seq[Terminal Boot Animation]
        scroll_track[Scroll Section Active Tracker]
        reveal_obs[Intersection Observer Fade-in]
        nav_toggle[Mobile Menu Toggle]
    end

    %% Store Flows
    subgraph store.js [E-Commerce Engine]
        fetch_db[Fetch Catalog Dataset]
        render_grid[Render Product Catalog Cards]
        filter_cat[Category Selection Menu Filter]
        cart_engine[Cart state storage & LocalStorage Sync]
        modal_details[Module Specs Details Overlay]
        checkout_sim[Checkout CLI Handshake Terminal]
    end

    %% Linkages
    script --> init_particles
    script --> boot_seq
    script --> scroll_track
    script --> reveal_obs
    script --> nav_toggle

    store_js --> fetch_db
    fetch_db --> filter_cat
    fetch_db --> render_grid
    render_grid --> cart_engine
    render_grid --> modal_details
    cart_engine --> checkout_sim
```

---

## 📁 1. Portfolio Page Journey (`index.html` → `script.js`)

When a user opens `index.html` (the homepage), the following asynchronous event hooks are initialized under the DOM `DOMContentLoaded` listener.

### Path A: Terminal Boot Sequence
1. **Target Container**: `#bootLog` terminal wrapper.
2. **Commit Pipeline**: An array of `bootLines` containing system state outputs (e.g. `nexus_core`, `anurag.dev`) is parsed.
3. **Execution (`script.js:L21-32`)**:
   - Loops through `bootLines`.
   - Appends elements with the class `.boot-line`.
   - Utilizes `setTimeout` mapping to stagger line appearance via the `.visible` opacity transition class.
4. **Hero Reveal (`script.js:L35-39`)**:
   - Fires a final `setTimeout` delay at `2200ms` which appends class `.active` to `.hero-identity`, fading in your title and bio block.

### Path B: Particle Background Canvas
1. **Setup (`script.js:L117-123`)**:
   - Dynamically prepends a `<canvas>` element to `document.body` with absolute pointer-events-free styling.
2. **Object Creation (`script.js:L135-164`)**:
   - Initializes a set of 45 `Particle` objects.
   - Assigns random float velocities (`vx`, `vy`), positions, sizing, and theme color codes (either teal or amber).
3. **Render Loop (`script.js:L189-201`)**:
   - Calls `loop()` recursively via `requestAnimationFrame(loop)`.
   - Clears coordinates, updates positions, redraws circles, and executes `drawConnections()` (which draws a thin line between points within `100px` range).
   - **Performance check**: Bypassed if `prefers-reduced-motion` is active.

### Path C: Layout & Observer Utilities
- **Active Navigation (`script.js:L77-98`)**: Adds a `scroll` listener calling `tracker()`. Checks the current scroll position against all `<section>` offsets and highlights the respective navigation link.
- **Scroll Reveal (`script.js:L100-114`)**: Wire up an `IntersectionObserver` that automatically toggles the class `.visible` on elements marked with `.reveal` once they enter the viewport.
- **Mobile Toggle (`script.js:L55-74`)**: Manages navigation expand states (`aria-expanded` and class `.open`) for touch screens.

---

## 🛒 2. E-Commerce Storefront Journey (`store.html` → `store.js`)

When entering the Store section (`store.html`), the application acts as a client-side database-driven single-page store.

### Path A: Database Fetching & Rendering
1. **Fetch Request (`store.js:L28-41`)**:
   - Fires an asynchronous HTTP request using `fetch('products.json')`.
   - On success, saves output to the local arrays, initializes filters, and synchronizes the shopping cart from `localStorage`.
2. **Layout Builder (`store.js:L44-91`)**:
   - Loops through elements, building cards dynamically inside `#catalogContainer`.
   - Applies event listeners for `ADD_TO_CART` buttons and product details buttons.
3. **Category Filtering (`store.js:L94-120`)**:
   - Extracts unique categories from `products.json` and updates the `#filterContainer` filter bar.
   - Toggles layout rendering lists between `all` items or filtered item lists depending on selection.

### Path B: Local Cart State Controller
1. **Addition (`store.js:L123-138`)**:
   - Triggers `addToCart()`. If product ID already exists in the cart array, increases item quantity; otherwise, pushes object with initial quantity = 1.
2. **Synchronization (`store.js:L159-225`)**:
   - Synchronizes cart lists to local storage using `localStorage.setItem('cyberCart', JSON.stringify(cart))`.
   - Refreshes navigation count badge (`#cartBadge`), re-calculates subtotals, tax margins (8% standard), and totals, and updates the slider panel display `#cartItemsContainer`.

### Path C: Simulated Transaction CLI Terminal
1. **Initialization (`store.js:L291-319`)**:
   - Triggers when clicking `checkoutBtn`. Closes cart drawer and displays the terminal simulator popup overlay.
2. **Mock Decryption Sequence (`store.js:L321-355`)**:
   - Sequences terminal strings through a timeline (Gateway logs, encryption handshake check, invoice totals printing, mock card payment, success handshake).
   - Once complete, purges the `localStorage` cart array and updates the storefront view to clean values.
