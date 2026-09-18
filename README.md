# MIESS — mechanical website redesign

An editable, responsive frontend for the Mechanical And Industrial Engineering Students Society, IIT Roorkee.

## Start here

1. Extract the **entire ZIP**. Do not open the preview from inside the ZIP viewer.
2. Double-click **OPEN-PREVIEW.html** in the extracted folder. It includes the scripts and styles, and loads photos from the adjacent `assets` folder.
3. Click **Replay assembly** to see the five-arm introduction again. Open **Menu** to navigate.

For development with Antigravity, open this entire folder and run:

```sh
npm run dev
```

Open `http://localhost:5173`. Node.js 18 or newer is required for these commands. There are **no dependencies to install**; `npm install` is unnecessary.

## What is included

- Five silver articulated arms with blue joints, individual grippers, and metallic MIESS letters.
- M arrives from the left; I from above; E from below; first S from above; last S from the right.
- Fixed-length upper arms and forearms, inverse kinematics, upright carried letters, visible release, and withdrawal.
- Society name and IIT Roorkee reveal after assembly; replay, skip, and reduced-motion support.
- A light shared blueprint grid and four slowly rotating gear systems.
- A hamburger menu retaining Home, About Us, Events, Team, Gallery, and Contact.
- All nine original events, nine team entries, seven gallery images, contact details, and social links.
- Responsive layouts, an expandable events collection, and an accessible native-dialog gallery viewer.
- Optimised WebP images, plus the original PNG images retained in `assets/images`.
- A generated animation sample in `verification/assembly-preview.gif`.

## Important: the uploaded archive

The supplied `miess.zip` contained a **published React build**, with `index.html`, bundled JavaScript/CSS, images, and source maps. It did not contain `package.json`, an editable React project, or the separate Antigravity redesign.

The source maps were used to recover the original content and identify existing behaviour. This delivery is an **editable standalone HTML/CSS/JavaScript implementation** of the discussed design. It is not a patch to an unseen Antigravity project. The original uploaded ZIP was not modified.

If you later want to integrate only the arms into your separate React project, the isolated engine is `src/assembly.js`: initialise it after mounting the corresponding hero markup, and call the returned cleanup function on unmount. The engine expects the IDs and classes used in the hero in `index.html`; `TIMING`, `computeScene`, and `sceneMarkup` contain the main animation logic.

## Files to edit

| File | Purpose |
| --- | --- |
| `index.html` | All page content, events, team profiles, gallery, contact details, and accessible markup. |
| `styles.css` | Colours, spacing, layouts, responsive breakpoints, grid and gear appearance. |
| `src/assembly.js` | Arm geometry, letter artwork, grippers, timing, animation lifecycle, desktop/mobile scene layouts. |
| `src/main.js` | Navigation, gear systems, event expansion, gallery viewer, and email draft action. |
| `assets/images/` | Optimised images and retained original images. |
| `tools/` | Dependency-free local server, packaging build, and geometry/content checks. |
| `verification/` | Check results, reference animation frames, animated sample, and original content inventory. |

Edit the source files above, then run `npm run build` to refresh both `dist/` and `OPEN-PREVIEW.html`. The preview is generated; do not use it as your main editing file. `verification/original-content.json` is a record of the original supplied content, not an active website data source.

### Adjusting the look and animation

- Site colours: CSS variables at the top of `styles.css`.
- Arm arrival/release/withdrawal timing: `TIMING` and `DURATION` in `src/assembly.js`.
- Base positions, segment lengths, entry offsets, and letter placement: `computeScene()` in the same file.
- Letter outlines and bolts: `LETTERS`.
- Metallic materials: SVG gradient definitions in `assembly.js`.
- Mobile scene breakpoint: 650px in both JavaScript and CSS; change them together.
- Gear contrast: `.gear-layer` in `styles.css`; rotational period: `.gear-spin`.

After changing arm geometry, run `npm run check` to make sure targets remain reachable and the links remain rigid.

## Contact form behaviour

The original source used EmailJS but its service and template IDs were literal placeholders (`service_ID` and `template_ID`). A working delivery configuration could not be recovered.

The redesigned form therefore honestly says **Open email draft**. It validates the fields and opens a prepared `mailto:` draft; the visitor reviews and sends it through their email app. The website does not send the message itself or claim delivery. A direct email link is provided if no mail app is configured.

If the society wants direct form submission, the deployment team must configure a working delivery service or backend, with real success/error handling. No external test messages were sent.

## Deployment handover

Run:

```sh
npm run check
npm run build
npm run preview
```

The supplied **`dist` folder is already built**. The deployment team should:

1. Preview the build and review the contact behaviour and supplied team roster.
2. Back up the current site through their normal process.
3. Copy the **contents of `dist/`** to the MIESS website's document root, keeping the `assets` and `src` subfolders intact.
4. Ensure `.js` files use a JavaScript MIME type and `.webp` files use `image/webp`.
5. Reload the site and check navigation, animation, photos, and email links.

The production site is static: no Node server, npm packages, database, environment variables, CDN, or external font service is needed on the hosting server. Relative asset paths support deployment at the domain root or within a subdirectory. Navigation uses ordinary section anchors; there are no application routes requiring a history fallback.

Do not upload `OPEN-PREVIEW.html`, development tools, this README, or the verification files to the public site unless you specifically want them public. `dist/` contains the site files only. Nothing has been published to the live IIT Roorkee site by this work.

## Validation performed

- `npm run check`: 2,920 sampled arm poses across desktop/mobile scenes; finite coordinates, reachable wrists, fixed link lengths, attachment before release, immobile letters after release, correct directions, and final bounds.
- Verified that every local HTML asset reference and section anchor exists.
- Confirmed all 9 events, 9 people, and 7 gallery photos remain available.
- DOM simulation at 360, 390, 768, 1024, and 1440px media configurations, with reduced motion both on and off: completion, replay, skip, menu opening/closing, event expansion, and gallery controls.
- CSS parsed without errors; JavaScript syntax and build checked.
- Desktop and mobile SVG animation frames rendered and visually inspected.
- Built files served locally with correct content types and HTTP 200 responses.

### Still to verify on real browsers/devices

DOM simulation does not calculate CSS layout. Full browser screenshots, physical-device touch behaviour, native dialog focus behaviour, and email-app launching were not verified in this environment. Before publishing, check the complete page in Chrome/Firefox/Safari, a real phone, portrait/landscape orientations, reduced-motion mode, and keyboard navigation. Team names and roles have been retained from the supplied archive; update them if needed.
