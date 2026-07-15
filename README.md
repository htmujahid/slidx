# visx

visx is a browser-based SVG animation editor. The editing surface is a live SVG document — shapes, filter/gradient definitions, and SMIL animations are all nodes in the same [craft.js](https://craft.js.org/) tree, so what you build in the canvas is the SVG you export.

## Features

- **Shape toolbox** — rect, circle, ellipse, line, polyline, polygon, path, text, textPath, image, group, and `<use>`, dragged straight onto the canvas.
- **Properties panel** — per-shape attribute editing driven by field definitions.
- **Timeline** — SMIL `<animate>`, `<animateTransform>`, `<animateMotion>`, and `<set>` clips per shape, with a scrubbable playhead, transport controls, and playback driven by the SVG's native animation clock.
- **Filters & defs** — the full set of SVG filter primitives (`feGaussianBlur`, `feColorMatrix`, `feComposite`, lighting primitives, etc.), linear/radial gradients, clip paths, masks, patterns, and markers, with presets and drag-to-apply onto shapes or timeline tracks.
- **Share links** — the current document state is compressed and encoded into the URL hash so a design can be shared without a backend.

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for dev/build tooling
- [@craftjs/core](https://craft.js.org/) as the editor/node-tree engine
- [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)

## Getting started

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Other scripts:

```bash
npm run build      # type-check and build for production
npm run preview    # preview the production build
npm run lint        # eslint
npm run format       # prettier --write
npm run typecheck   # tsc --noEmit
```

## Project structure

```
src/components/editor/
  canvas/       # canvas panel, grid, transport bar
  craft/        # craft.js node components: shapes, defs/filters, animations
  elements/     # left-side toolbox (shapes, filters)
  header/       # top bar, share button
  properties/   # right-side properties panel
  timeline/     # bottom timeline (tracks, clips, playhead)
```
