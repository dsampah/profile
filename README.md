# David Sampah · Portfolio

Personal portfolio and CV site. Plain HTML, CSS and JavaScript with no build step.

## Structure

- `index.html` holds all content: about, experience, education, talks and events, projects, skills, training, press and contact.
- `assets/styles.css` holds the design, including light and dark themes and a print layout.
- `assets/script.js` handles the theme toggle, event filters and navigation highlighting.

## Preview locally

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Publish with GitHub Pages

1. Push to the `main` branch of `dsampah/profile`.
2. On GitHub, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, then `main` and `/ (root)`.

The site will be served at <https://dsampah.github.io/profile/>.

## Editing

To add an event, copy an `<li class="ev">` block in `index.html` into the right year and set `data-kind` to `led`, `organised` or `attended` so the filters pick it up. Update the count in the section intro when you do.

Printing the page (or saving as PDF from the browser) produces a CV version.
