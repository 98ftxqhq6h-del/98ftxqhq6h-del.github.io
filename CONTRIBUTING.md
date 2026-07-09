# Contributing to Anurag's Portfolio

Welcome! If you are looking to contribute to this project, here is how you can help.

## Branching Strategy

We follow a simple branch management workflow:

1. **`main`**: Production-ready code. This branch automatically deploys to GitHub Pages.
2. **`dev`**: Integration branch for development. Do not commit directly to `main`.
3. **`feature/*`**: Short-lived branches for specific tasks, bug fixes, or design tweaks.

```
main (Production / Live)
  ▲
  └── dev (Active development)
        ▲
        ├── feature/add-new-project
        └── feature/improve-styles
```

## How to Contribute

1. **Create a Feature Branch**:
   - Always branch off of `dev`.
   - Name your branch: `feature/<task-name>` or `bugfix/<issue-name>`.
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/awesome-feature
   ```

2. **Make Your Changes**:
   - Keep styling inside [style.css](file:///style.css).
   - Keep interactions inside [script.js](file:///script.js).
   - Follow clean semantic HTML structures inside [index.html](file:///index.html).

3. **Verify Locally**:
   - Run a local server to test layout and animations:
     ```bash
     python3 -m http.server 8080
     ```

4. **Commit Guidelines**:
   - Use [Conventional Commits](https://www.conventionalcommits.org/):
     - `feat:` for new additions.
     - `fix:` for bug fixes.
     - `docs:` for readme or instructions.
     - `style:` for CSS/formatting tweaks.
     - `chore:` for settings/workflows.

5. **Open a Pull Request**:
   - Push to your branch on GitHub.
   - Open a PR targeting the **`dev`** branch of this repository.
   - Once reviewed and merged into `dev`, changes are merged into `main` to trigger the automatic deployment.

Thank you for contributing! ⚡
