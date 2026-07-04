# Chrome Web Store Listing — Python Docs Beautifier - Material Theme

> Last Updated: 2026-07-02

## Store Listing

**Extension Name** [REQUIRED]
Python Docs Beautifier - Material Theme

**Short Description** [REQUIRED]
A premium Material design theme for Python's official documentation with dark mode, sepia, code copy, and ScrollSpy TOC.

**Detailed Description** [REQUIRED]
A premium custom theme for Python's official documentation matching the gorgeous MkDocs Material design system. Elevate your documentation reading experience with a beautiful visual layout, high-contrast typography, and developer-centric productivity features.

Key Features:
- Complete design overhaul matching the premium Material design system.
- Three custom themes: Midnight Slate (Dark Mode, One Dark Pro inspired), Daylight (GitHub Light inspired), and Warm Sepia (eye comfort mode).
- Smart Header integration: Prev/Next chapter arrow shortcuts, Index/Modules links, and version/language dropdown select switchers.
- Collapsible responsive sidebar with smooth custom animations.
- Dynamic right-side Table of Contents (TOC) with scroll-sync (ScrollSpy) and smooth scrolling.
- Hides interactive Python shell prompts (">>>") from copy buffers by default for clean code copy-pasting.
- Clipboard copy utilities on all code blocks with instant copy-success feedback.
- Keyboard shortcuts for ultimate convenience: cycle themes ('T'), focus search ('S' or '/'), toggle navigation sidebar ('\').
- Zero tracking or telemetry: works entirely locally on your machine.

How to Use:
1. Install this extension.
2. Navigate to any official Python documentation page (docs.python.org).
3. The premium Material UI overrides will apply automatically.
4. Toggle the sidebar using the top-left button or by pressing '\'.
5. Cycle through Dark, Light, and Sepia themes with the sun/moon icon or by pressing 'T'.
6. Hover over code blocks to copy their raw content to your clipboard.

Privacy & Permissions:
All data is stored locally on your device via Chrome's local storage sync. No analytics, tracking, or personal data is collected or sent off-device.

Support & Feedback:
For bug reports, source code, or feature requests, visit the project home on GitHub at https://github.com/python/cpython (or the repository containing the extension source).

**Category** [REQUIRED]
Developer Tools

**Single Purpose** [REQUIRED]
Applies a premium Material theme with dark mode, interactive Table of Contents, and code copy tools to Python's official documentation.

**Primary Language** [REQUIRED]
English


## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | `icons/icon128.png` |
| Screenshot 1 [REQUIRED] | 1280×800 | ⬜ Not created | |
| Screenshot 2 [RECOMMENDED] | 1280×800 | ⬜ Not created | |
| Screenshot 3 [RECOMMENDED] | 1280×800 | ⬜ Not created | |
| Small Promo Tile [RECOMMENDED] | 440×280 | ⬜ Not created | |

### Screenshot Notes
- **Screenshot 1**: Showing the premium "Midnight Slate" dark theme layout, right ScrollSpy TOC sidebar, and the new sticky header with the merged navigation bar.
- **Screenshot 2**: Showing the "Daylight" light theme, code blocks with the hover "Copy" button visible, and the clean inline code syntax highlighting.
- **Screenshot 3**: Showing the "Warm Sepia" theme with warning and admonition callout boxes highlighted with high-contrast text.


## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `storage` | permissions | Used to persist user configuration preferences (such as selected theme, sidebar collapse state, and font size scale) across pages. |
| `https://docs.python.org/*` | host_permissions | Required to inject content.css and content.js into the official Python documentation pages to rewrite the theme and layout. |


## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** No

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes


## Privacy Policy

**Privacy Policy URL** [RECOMMENDED]
https://github.com/ahadkhan9/agentic-coding/blob/main/python-docs-beautifier-material/PRIVACY.md

*(Note: Create PRIVACY.md in the repo with the standard no-collection template.)*


## Distribution

**Visibility**: Public
**Regions**: All regions
**Pricing**: Free


## Developer Info

**Publisher Name** [REQUIRED]
Ahad Khan

**Contact Email** [REQUIRED]
ahadkhan@example.com

**Support URL / Email** [RECOMMENDED]
https://github.com/ahadkhan9/agentic-coding/issues


## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.0.0 | 2026-07-02 | Initial release with Material styling, theme support, code copy utility, and custom navigation layout. | Draft |


## Review Notes

### Known Issues / Limitations
- Relies on docs.python.org markup. Major upstream Sphinx version changes might affect layout selectors.
