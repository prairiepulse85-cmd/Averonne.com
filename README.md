# Averonne Research and Consulting

**averonne.com** — Research-Led. Collaboration-Driven.

Single-page website for Averonne Research and Consulting.

## Structure

```
averonne.com/
├── index.html                  # Single-page site, all sections
├── css/
│   └── styles.css              # Design tokens + all styles
├── js/
│   └── main.js                 # Nav, forms, modal, scroll animations
├── assets/
│   └── images/
│       ├── malka-zehra.jpg     # ← ADD THIS: Malka's headshot
│       ├── jmi-logo.svg        # Jamia Millia Islamia logo
│       └── cimmyt-logo.svg     # CIMMYT logo
└── README.md
```

## Setup

No build step required. Open `index.html` in a browser.

### To add Malka's photo

Place `malka-zehra.jpg` in `assets/images/`, then in `index.html` uncomment:
```html
<img src="assets/images/malka-zehra.jpg" alt="Malka Zehra — Social Sciences Research Lead" class="leader-card__photo" />
```
And remove the placeholder `<div class="leader-card__photo-placeholder">` block.

### To enable form submission (Formspree)

1. Create a free account at formspree.io
2. Create a new form and copy the endpoint URL
3. Set `data-formspree="https://formspree.io/f/XXXXXXXX"` on `<form id="contact-form">`

### To replace logo placeholders with real logos

```bash
curl -L "https://upload.wikimedia.org/wikipedia/en/f/fc/Jamia_Millia_Islamia_logo.png" \
  -o assets/images/jmi-logo.png
```
Then update the `<img src>` in `index.html` accordingly.

## Contact

- General: headoffice@averonne.com
- Research Lead: Malkaz@averonne.com
