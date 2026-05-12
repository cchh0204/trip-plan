---
name: Collaborative Travel Design System
colors:
  surface: '#fbf9fa'
  surface-dim: '#dbd9db'
  surface-bright: '#fbf9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f4'
  surface-container: '#f0edee'
  surface-container-high: '#eae7e9'
  surface-container-highest: '#e4e2e3'
  on-surface: '#1b1b1d'
  on-surface-variant: '#44474c'
  inverse-surface: '#303032'
  inverse-on-surface: '#f2f0f1'
  outline: '#74777d'
  outline-variant: '#c4c6cc'
  surface-tint: '#525f71'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#0f1c2c'
  on-primary-container: '#778598'
  inverse-primary: '#bac8dc'
  secondary: '#545e76'
  on-secondary: '#ffffff'
  secondary-container: '#d7e2ff'
  on-secondary-container: '#5a647c'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#001d36'
  on-tertiary-container: '#6d86a5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e4f9'
  primary-fixed-dim: '#bac8dc'
  on-primary-fixed: '#0f1c2c'
  on-primary-fixed-variant: '#3a4859'
  secondary-fixed: '#d7e2ff'
  secondary-fixed-dim: '#bbc6e2'
  on-secondary-fixed: '#101b30'
  on-secondary-fixed-variant: '#3c475d'
  tertiary-fixed: '#d1e4ff'
  tertiary-fixed-dim: '#afc9ea'
  on-tertiary-fixed: '#001d36'
  on-tertiary-fixed-variant: '#2f4865'
  background: '#fbf9fa'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e3'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  mono-data:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 24px
  panel-gap: 16px
  floating-margin: 20px
---

## Brand & Style
The brand personality of this design system is defined by precision, collective intelligence, and the seamless fusion of data with exploration. It targets power travelers and groups who require a high-utility, low-friction environment to synthesize complex itineraries.

The style is a blend of **Minimalism** and **Glassmorphism**, taking heavy inspiration from high-tech AI workbenches. It utilizes a "Map-First" philosophy where the interface sits on top of the world as a transparent, functional layer. The aesthetic is clean, sophisticated, and utilitarian, evoking the feeling of a mission control center for global travel.

## Colors
The palette is anchored by a deep corporate blue that provides a sense of reliability and institutional depth. To contrast this, collaborative elements (Member Colors) utilize a "Vibrant-Muted" approach—high in chroma but lowered in saturation—to ensure legibility without overwhelming the map data.

High-priority actions and "Confirmed Places" utilize a deep solid black (#000000) to create an absolute visual stop against the lighter map or interface layers. This design system supports both light and dark modes, prioritizing high-tech transparency and "frosted" surfaces in both.

## Typography
The typography system uses **Inter** to achieve a neutral, systematic look that stays out of the way of the travel content. For data-heavy elements like coordinates, flight numbers, or time stamps, a secondary monospaced font is introduced to provide a technical edge.

The scale is intentionally tight, favoring smaller, legible type with generous line-heights to maintain the minimalist aesthetic. Headlines use a slightly tighter letter-spacing to emphasize the high-tech, "engineered" feel of the platform.

## Layout & Spacing
The layout operates on a **Map-Centric Canvas** with floating panels rather than a traditional grid. 

- **Desktop:** A large central map area serves as the base layer. Floating panels (320px - 400px wide) sit on the left and right margins with a 20px offset from the screen edge.
- **Collaboration Bar:** A persistent bottom-docked or top-docked bar handles collaborative tools and AI input, inspired by the Gemini interface.
- **Adaptation:** On mobile, the map remains the background, but floating panels collapse into a bottom-sheet drawer system to maximize visibility.

## Elevation & Depth
Depth is conveyed through **Glassmorphism** and backdrop filters. Rather than heavy shadows, this design system uses `backdrop-filter: blur(12px)` combined with a subtle 1px border of low-opacity white (in dark mode) or dark blue (in light mode).

Layering logic:
1. **Base Layer:** The interactive map.
2. **Surface Layer:** Floating sidebars and cards with a semi-transparent background.
3. **Overlay Layer:** Modals and tooltips with higher opacity and a soft ambient shadow (0px 8px 24px rgba(0,0,0,0.12)) to separate them from the workspace.

## Shapes
The shape language is modern and approachable but retains a professional edge. Standard UI elements use a 0.5rem (8px) corner radius. 

- **Interactive Elements:** Buttons and input fields use the base 8px radius.
- **Large Containers:** Floating panels and sheets use a 1rem (16px) radius to soften the technical layout.
- **Pills:** Member avatars and status tags (chips) use fully rounded "pill" shapes to differentiate them from functional UI blocks.

## Components
### Buttons & Inputs
Buttons are primarily the Deep Corporate Blue with white text. Secondary buttons use the glassmorphic style (transparent with a border). The AI Input bar is a prominent, floating pill-shaped field centered at the bottom of the screen, mimicking the prompt-style interaction of AI Studio.

### Member Chips & Cursors
Collaborators are represented by low-saturation color-coded avatars. When multiple users are active, "presence cursors" in their assigned member color appear over the map and itinerary.

### Confirmed Place Cards
Once a location is confirmed, its card transitions to a "High Contrast" state: Deep solid black background with white typography. This creates a clear visual hierarchy between "planned" and "finalized" items.

### Itinerary Timeline
A vertical, thin-line list component located in the floating side panel. It uses monospaced font for times and the standard sans-serif for destination names.

### Floating Map Controls
Small, square glassmorphic buttons stacked vertically on the right side for zoom, compass, and layer toggles.