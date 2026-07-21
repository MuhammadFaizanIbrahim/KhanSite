# Khan — The Unseen · React + Tailwind

## Stack
- **React 18** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** (styling)
- **React Router v6** (routing)
- **Raw WebGL + GLSL** (transitions — no Three.js)

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx          # Top nav with auto toggle
│   │   ├── Sidebar.tsx         # Arrow navigation
│   │   └── Dots.tsx            # Right side dots
│   ├── sections/
│   │   ├── HomeSlideshow.tsx   # Main WebGL slideshow
│   │   └── SlideText.tsx       # Animated text lines
│   └── ui/
│       └── Preloader.tsx       # Asset loading screen
├── hooks/
│   └── useWebGL.ts             # All WebGL logic
├── data/
│   ├── sections.ts             # Content + image URLs
│   └── shaders.ts              # GLSL shader strings
├── pages/
│   ├── HomePage.tsx
│   ├── ConceptsPage.tsx
│   ├── ConceptDetailPage.tsx
│   └── ContactPage.tsx
├── App.tsx                     # Routes + preloader gate
├── main.tsx                    # Entry point
└── index.css                   # Tailwind + custom styles
```

## Setup

**1. Install**
```bash
npm install
```

**2. Add font**
Place `bastliga-one_regular.otf` in `public/fonts/`

**3. Dev server**
```bash
npm run dev
```

**4. Build**
```bash
npm run build
```

## Fonts Used
| Role       | Font             | Source          |
|------------|------------------|-----------------|
| Logo       | Bastliga One     | `public/fonts/` |
| Titles     | Playfair Display | Google Fonts    |
| Sub-titles | Manrope          | Google Fonts    |
| Body text  | Inter            | Google Fonts    |

## Transitions
| Trigger               | Effect                        |
|-----------------------|-------------------------------|
| Section scroll/auto   | Organic chaotic dissolve      |
| Nav link click        | Glass lens morph              |

## Customise
- **Content/images** → `src/data/sections.ts`
- **Auto speed** → `SECTION_INTERVAL` in `src/data/sections.ts`
- **Shader effects** → `src/data/shaders.ts`
- **Colors/fonts** → `tailwind.config.js` + `src/index.css`
