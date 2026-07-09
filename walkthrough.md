# Repository & E-Commerce Setup Walkthrough

Here is a summary of the changes we made to align your repository with modern development standards, set up professional workflows, and build your premium Cyberpunk E-Commerce Storefront.

---

## 🛒 What Was Accomplished

### 1. Cyberpunk E-Commerce Storefront
We built a premium, client-side e-commerce storefront accessible at `/store.html` that aligns with your portfolio's theme.
* **Store Layout ([store.html](file:///Users/anuragkuamr/98ftxqhq6h-del%20/store.html))**: Semantic page with product listings grid, navigation menus, and category filters. Integrated a "Store" navigation link across both pages.
* **Database Catalog ([products.json](file:///Users/anuragkuamr/98ftxqhq6h-del%20/products.json))**: Contains structured data for your digital modules (like the Nexus Core AI Bot, Python Scraping scripts, Chronoverse UI Kit, Fine-tuner tools, and consulting hours).
* **Styles ([store.css](file:///Users/anuragkuamr/98ftxqhq6h-del%20/store.css))**: Glassmorphic filter buttons, glow hover effects, custom checkout modals, and a slide-out cart sidebar matching your theme colors.
* **Cart Logic ([store.js](file:///Users/anuragkuamr/98ftxqhq6h-del%20/store.js))**:
  - Dynamically fetches product records from the JSON database.
  - Interactive categories filter (AI Bots, Scripts, Templates, Services).
  - Add to cart, quantity selectors, and automatic tax/total calculation.
  - Persists selected items in the user's browser via `localStorage` so items remain even if they refresh the tab.
  - **Simulated Transaction Console**: Generates a terminal console window performing mock decryption handshakes, transaction credits, and order delivery outputs on checkout.

### 2. Unified Cyberpunk Design System
* **HTML Structure ([index.html](file:///Users/anuragkuamr/98ftxqhq6h-del%20/index.html))**: Refactored to separate HTML, CSS, and JS. Unified styling classes and linked to global style sheets.
* **Styles ([style.css](file:///Users/anuragkuamr/98ftxqhq6h-del%20/style.css))**: Moved styling elements to a dedicated stylesheet with layered resets, layout tokens, and cyberpunk elements (glowing borders, scanline filters, neon buttons).
* **Interactions ([script.js](file:///Users/anuragkuamr/98ftxqhq6h-del%20/script.js))**: Combined terminal boot sequences, responsive slideout selectors, scroll reveal trackers, and a dynamic particle background network.

### 3. Git & Documentation Setup
* **`.gitignore`**: Excludes system junk (`.DS_Store`), Node modules, Python caching files, local environment files (`.env`), and IDE layout folders.
* **`README.md`**: Created a cyberpunk readme profile with terminal commands, badges, stats grids, contribution snakes, and contact details.
* **`CONTRIBUTING.md` & `CODE_OF_CONDUCT.md`**: Detailed workflow guides for developers and community pledges.

### 4. GitHub Workflows (CI/CD)
* **Snake contribution generator**: Active configuration stored under [.github/workflows/snake.yml](file:///Users/anuragkuamr/98ftxqhq6h-del%20/.github/workflows/snake.yml).
* **Pages Deployment**: added [.github/workflows/deploy.yml](file:///Users/anuragkuamr/98ftxqhq6h-del%20/.github/workflows/deploy.yml) to deploy changes live automatically on pushes to `main`.
* **Validation Check**: added [.github/workflows/lint.yml](file:///Users/anuragkuamr/98ftxqhq6h-del%20/.github/workflows/lint.yml) to check HTML/JS syntax errors on PR branches.

---

## 🔍 How to Verify and Finalize

1. **Local Sandbox Test**:
   Run a local preview server in your workspace:
   ```bash
   python3 -m http.server 8080
   ```
   Open the links in your browser:
   * **Portfolio**: [http://localhost:8080](http://localhost:8080)
   * **Storefront**: [http://localhost:8080/store.html](http://localhost:8080/store.html)

2. **Open a Pull Request**:
   Merge the storefront and repository files from your development branch into `main`:
   👉 **[Create PR: dev → main](https://github.com/98ftxqhq6h-del/98ftxqhq6h-del.github.io/pull/new/dev)**

3. **Verify Deployment**:
   Check the GitHub Actions tab once merged to ensure the Pages builder deploys the storefront to `anuragkumar.com/store.html` automatically!
