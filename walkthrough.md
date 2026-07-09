# Repository Setup Walkthrough

Here is a summary of the changes we made to align your repository with modern development standards, set up professional workflows, and integrate your custom designs.

---

## 🛠 What Was Accomplished

### 1. Unified Cyberpunk Design System
* **HTML Structure**: Cleaned up [index.html](file:///Users/anuragkuamr/98ftxqhq6h-del%20/index.html) by linking to separate, dedicated stylesheet and javascript files. Integrated your customized copy (skills, chatbots, projects, and contact info).
* **Styles**: Moved embedded styling from HTML to a dedicated, responsive [style.css](file:///Users/anuragkuamr/98ftxqhq6h-del%20/style.css) containing layered resets, layout tokens, and cyberpunk aesthetics (glowing borders, scanline overlays, neon buttons).
* **Interactions**: Moved JavaScript logic into [script.js](file:///Users/anuragkuamr/98ftxqhq6h-del%20/script.js). Merged your boot log animation with our floating particle network background and intersection observers for smooth card fade-in reveals.

### 2. Git & Documentation Restorations
* **`.gitignore`**: Recreated and expanded [.gitignore](file:///Users/anuragkuamr/98ftxqhq6h-del%20/.gitignore) to exclude system junk (`.DS_Store`), node artifacts (`node_modules`), Python caches, environment settings, and IDE layout configurations.
* **`README.md`**: Re-established your customized cyberpunk readme page [README.md](file:///Users/anuragkuamr/98ftxqhq6h-del%20/README.md) with dynamic terminal commands, badges, skill icons, stats layouts, and links.
* **Contributing & Governance Docs**:
  - Added [CONTRIBUTING.md](file:///Users/anuragkuamr/98ftxqhq6h-del%20/CONTRIBUTING.md) describing the branch system (`main` ← `dev` ← `feature/*`), local sandbox testing, and commit formatting.
  - Added [CODE_OF_CONDUCT.md](file:///Users/anuragkuamr/98ftxqhq6h-del%20/CODE_OF_CONDUCT.md) using the Contributor Covenant pledge.

### 3. GitHub Workflows (CI/CD)
* **Snake contribution animation**: Fixed the daily cron workflow by moving the active configurations to [.github/workflows/snake.yml](file:///Users/anuragkuamr/98ftxqhq6h-del%20/.github/workflows/snake.yml).
* **Pages Deployment**: Added [.github/workflows/deploy.yml](file:///Users/anuragkuamr/98ftxqhq6h-del%20/.github/workflows/deploy.yml) which builds and deploys your site directly to GitHub Pages securely on every push to `main`.
* **Verification / Linting**: Added [.github/workflows/lint.yml](file:///Users/anuragkuamr/98ftxqhq6h-del%20/.github/workflows/lint.yml) to automatically validate HTML integrity and verify JS syntax on pull requests.

### 4. Branch Management
* Created a local and remote **`dev`** branch for active feature iterations.
* Committed all work and pushed to the remote tracking branch `origin/dev`.

---

## 🔍 How to Verify and Finalize

1. **Test the Local Preview**:
   If the local server is still running, you can preview the merged files at [http://localhost:8080](http://localhost:8080).

2. **Open a Pull Request**:
   Create a pull request on GitHub to merge the new files from `dev` into `main`. The link to do this is:
   👉 **[Create PR: dev → main](https://github.com/98ftxqhq6h-del/98ftxqhq6h-del.github.io/pull/new/dev)**

3. **Verify GitHub Workflows**:
   - Check the **Actions** tab on your GitHub repository to verify that the **Lint Files** check passes on your PR.
   - Once merged into `main`, check that the **Deploy to GitHub Pages** workflow succeeds and publishes your changes live.

4. **Enable Branch Protection (Recommended)**:
   Go to your repository settings on GitHub (`Settings` → `Branches` → `Add branch ruleset`):
   - Restrict direct pushes to `main` and `dev`.
   - Require a pull request before merging.
   - Require status checks (like `Lint Files`) to pass before merging.
