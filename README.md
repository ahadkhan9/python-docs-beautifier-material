# Python Docs Beautifier - Material Theme

A premium Manifest V3 Chrome Extension that overhauls the official Python documentation pages using a gorgeous Material Design system. Elevate your documentation reading experience with high-contrast typography, customizable themes, and developer-centric productivity features.

---

## 🎨 Key Features

1. **Material Theme Overhaul**: Complete redesign matching the premium MkDocs Material theme.
2. **Three Custom Themes**:
   - **Midnight Slate** (Dark Mode, One Dark Pro inspired)
   - **Daylight** (GitHub Light inspired)
   - **Warm Sepia** (Eye comfort mode, perfect for long reading sessions)
3. **Smart Header**: Integrates custom Prev/Next chapter navigation shortcuts, Index/Modules links, and quick version/language switcher dropdowns.
4. **Collapsible Navigation Sidebar**: A responsive, collapsible sidebar with smooth transitions.
5. **ScrollSpy Table of Contents**: Dynamic right-side Table of Contents (TOC) synced to your scrolling position.
6. **Clean Code Copy**:
   - Copies clean code block content to your clipboard.
   - Automatically strips interactive Python prompt characters (`>>>` and `...`) from copy buffers.
   - Displays instant copy-success feedback.
7. **Keyboard Shortcuts**:
   - `T`: Cycle through themes (Midnight Slate -> Daylight -> Warm Sepia).
   - `S` or `/`: Focus the search bar.
   - `\`: Toggle navigation sidebar.
8. **No Tracking or Telemetry**: Runs entirely locally on your device with zero external requests.

---

## 📂 Project Structure

```text
python-docs-beautifier-material/
├── manifest.json       # Extension Manifest V3 configuration
├── content.css          # Core layout styling & theme color variables
├── content.js           # Dynamic components, hotkey listeners, and ScrollSpy
├── icons/               # Extension icons
├── package-extension.sh # Shell script to zip the extension for Chrome Web Store
├── CHROMEWEBSTORE.md    # Metadata copy for Chrome Web Store listing
├── PRIVACY.md           # No-collection privacy policy
└── README.md            # This documentation file
```

---

## 🔧 Installation (Load Unpacked in Chrome)

To load and use this extension on any of your laptops/devices:

1. **Get the Code**:
   Clone this repository to your laptop:
   ```bash
   git clone https://github.com/ahadkhan9/python-docs-beautifier-material.git
   ```
2. **Open Extensions Page**:
   In Google Chrome, navigate to `chrome://extensions`.
3. **Enable Developer Mode**:
   Turn on the **Developer mode** toggle switch in the top-right corner.
4. **Load the Extension**:
   - Click the **Load unpacked** button in the top-left corner.
   - Select the cloned `python-docs-beautifier-material` directory.
5. **View Official Docs**:
   Navigate to [docs.python.org/3](https://docs.python.org/3) to experience the premium Material UI.

---

## 📦 Packaging for Web Store

If you want to package the extension into a zip archive for upload to the Chrome Developer Dashboard:
```bash
chmod +x package-extension.sh
./package-extension.sh
```
This will produce a zip file named `python-docs-beautifier-material-v1.0.0.zip` (excluding git and development files).
