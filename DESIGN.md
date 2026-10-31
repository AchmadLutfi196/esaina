# ESAINA Design System Token & Component Specification (DESIGN.md)

## Brand Identity & Aesthetic Direction
- **System Name**: Bleu Océan Glassmorphism
- **Theme Concept**: Antarmuka institusi akademik modern dengan permukaan kaca jernih beraksen biru samudra dalam, ornamen hangat butter yellow, dan kontras teks tinggi.
- **Surface Philosophy**: Glassmorphism fungsional (backdrop blur 18px, specular top-edge highlight 1px, shadow bertingkat lembut, ambient floating orbs di latar belakang).

## Color Tokens

### Primary Palette (Bleu Océan)
- `color.brand.ocean`: `#0A1680` (Bleu Océan — brand primary, ink, header contrast)
- `color.brand.ciel`: `#93B2F8` (Bleu Ciel — brand secondary, interactive focus ring, sky accent)
- `color.brand.tint`: `#EBF2FD` (Bleu Tint — soft container tint, table hover)
- `color.brand.dark`: `#060E59` (Ocean Deep — active states, high contrast headers)

### Warm Accents
- `color.accent.butter`: `#FBEDB0` (Butter Yellow — badges, highlights, warm indicator)
- `color.accent.orange`: `#F1B94C` (Orange Pastel — warning, point pills, score emphasis)

### Backgrounds & Surfaces
- `color.bg.paper`: `#F2F6FD` (Canvas background)
- `color.surface.white`: `#FCFDFF` (Blanc Cassé — pure surface card)
- `color.surface.glass`: `rgba(255, 255, 255, 0.85)` (Glass panel background)
- `color.border.subtle`: `rgba(255, 255, 255, 0.80)` (Specular top edge border)
- `color.border.line`: `#C9D9E8` (Dividers and structural borders)

### Semantic Functional
- `color.status.success.bg`: `#E8F8F0`
- `color.status.success.ink`: `#0E623B`
- `color.status.warning.bg`: `#FFF7EB`
- `color.status.warning.ink`: `#8F5800`
- `color.status.danger.bg`: `#FDF2F2`
- `color.status.danger.ink`: `#9E1C1C`

## Typography

### Font Families
- **Primary / Body / UI**: `Plus Jakarta Sans`, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
- **Headings & Display**: `Plus Jakarta Sans` (weights 700, 800)
- **Monospace & Tabular Data**: `JetBrains Mono`, SFMono-Regular, monospace

### Scale & Hierarchy
- `font.size.xs`: `0.75rem` (12px) / line-height `1rem` (16px) — labels, badges, timestamps
- `font.size.sm`: `0.875rem` (14px) / line-height `1.25rem` (20px) — secondary body, buttons
- `font.size.base`: `1rem` (16px) / line-height `1.5rem` (24px) — standard body, input fields
- `font.size.lg`: `1.125rem` (18px) / line-height `1.75rem` (28px) — subsection headers
- `font.size.xl`: `1.25rem` (20px) / line-height `1.75rem` (28px) — card headers
- `font.size.2xl`: `1.5rem` (24px) / line-height `2rem` (32px) — page titles
- `font.size.3xl`: `1.875rem` (30px) / line-height `2.25rem` (36px) — dashboard metrics

## Elevation & Glass Spec
- **Glass Panel**:
  - `backdrop-filter: blur(20px)`
  - `background: rgba(255, 255, 255, 0.85)`
  - `border: 1px solid rgba(255, 255, 255, 0.85)`
  - `box-shadow: 0 20px 60px rgba(10, 22, 128, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.95)`
- **Glass Card**:
  - `backdrop-filter: blur(14px)`
  - `background: rgba(255, 255, 255, 0.90)`
  - `border: 1px solid rgba(255, 255, 255, 0.75)`
  - `box-shadow: 0 8px 30px rgba(10, 22, 128, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.8)`
- **Border Radius**:
  - `radius.sm`: `8px`
  - `radius.md`: `12px`
  - `radius.lg`: `16px`
  - `radius.xl`: `20px`
  - `radius.2xl`: `24px`

## Motion & Transitions
- `motion.duration.fast`: `150ms` (hover, active button tap)
- `motion.duration.normal`: `250ms` (dropdowns, tabs, dialog fade-in)
- `motion.duration.slow`: `400ms` (card entrance, drawer expansion)
- `motion.easing.standard`: `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo)
- `motion.ambient`: `keyframes float-slow` (18s infinite ease-in-out for background orbs)

## Accessibility Compliance
- **Text Contrast**: Seluruh body text ink (`#0A1680`) memiliki rasio kontras 10.4:1 terhadap latar putih/kaca (melebihi standar WCAG AAA 7:1).
- **Focus Rings**: `outline: 2px solid var(--color-brand); outline-offset: 3px;` pada semua elemen interaktif.
- **Prefers-Reduced-Motion**: Menonaktifkan animasi ambient orbs saat pengguna menyetel reduced motion.
