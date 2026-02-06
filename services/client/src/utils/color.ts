import {
  argbFromHex,
  hexFromArgb,
  themeFromSourceColor,
} from '@material/material-color-utilities'

export const PALETTES = [
  /* 🌲 Nature / Calm */
  { name: 'Forest', color: '#2f855a' },
  { name: 'Emerald', color: '#10b981' },
  { name: 'Garden', color: '#4caf50' },
  { name: 'Moss', color: '#6b8e23' },
  { name: 'Pine', color: '#14532d' },
  { name: 'Sage', color: '#84a98c' },

  /* 🌊 Blues */
  { name: 'Ocean', color: '#0284c7' },
  { name: 'Sky', color: '#38bdf8' },
  { name: 'Indigo', color: '#6366f1' },
  { name: 'Azure', color: '#007fff' },
  { name: 'Arctic', color: '#67e8f9' },
  { name: 'Deep Sea', color: '#0c4a6e' },

  /* 🔥 Warm / Energy */
  { name: 'Sunset', color: '#f97316' },
  { name: 'Amber', color: '#f59e0b' },
  { name: 'Rose', color: '#f43f5e' },
  { name: 'Coral', color: '#fb7185' },
  { name: 'Peach', color: '#fdba74' },
  { name: 'Crimson', color: '#dc2626' },

  /* 🌙 Dark / Moody */
  { name: 'Dracula', color: '#7c3aed' },
  { name: 'Midnight', color: '#0f172a' },
  { name: 'Abyss', color: '#020617' },
  { name: 'Obsidian', color: '#111827' },
  { name: 'Eclipse', color: '#312e81' },
  { name: 'Void', color: '#09090b' },

  /* 🧠 Neutral / Professional */
  { name: 'Slate', color: '#64748b' },
  { name: 'Stone', color: '#78716c' },
  { name: 'Graphite', color: '#3f3f46' },
  { name: 'Ash', color: '#a1a1aa' },
  { name: 'Sand', color: '#d6cfc4' },
  { name: 'Cloud', color: '#e5e7eb' },

  /* 🎮 Fun / Neon */
  { name: 'Cyberpunk', color: '#ec4899' },
  { name: 'Lime', color: '#84cc16' },
  { name: 'Electric', color: '#22d3ee' },
  { name: 'Neon Purple', color: '#c084fc' },
  { name: 'Laser', color: '#22c55e' },
  { name: 'Bubblegum', color: '#f472b6' },
]

// Custom seeds for semantic colors
// You can adjust these hex codes to match your brand preferences
const SEMANTIC_SEEDS = {
  success: '#10b981', // Green
  warning: '#f59e0b', // Amber/Orange
  info: '#38bdf8', // Light Blue
}

const mix = (base: string, overlay: string, percent: number) =>
  `color-mix(in srgb, ${base} ${100 - percent}%, ${overlay} ${percent}%)`

export function generateTheme(seedHex: string, mode: 'light' | 'dark') {
  // Generate the main theme from the primary seed
  const theme = themeFromSourceColor(argbFromHex(seedHex), [
    {
      name: 'success',
      value: argbFromHex(SEMANTIC_SEEDS.success),
      blend: true,
    },
    {
      name: 'warning',
      value: argbFromHex(SEMANTIC_SEEDS.warning),
      blend: true,
    },
    { name: 'info', value: argbFromHex(SEMANTIC_SEEDS.info), blend: true },
  ])
  const scheme = mode === 'light' ? theme.schemes.light : theme.schemes.dark

  const c = (v: number) => hexFromArgb(v)

  // Helper to extract custom colors from the generated theme
  // Material Color Utilities custom colors are stored in the 'customColors' array
  // We need to find them by name and extract their light/dark scheme values
  const getCustomColor = (key: string) => {
    const customColorGroup = theme.customColors.find(
      (c) => c.color.name === key,
    )
    if (!customColorGroup) return null
    return mode === 'light' ? customColorGroup.light : customColorGroup.dark
  }

  const successGroup = getCustomColor('success')
  const warningGroup = getCustomColor('warning')
  const infoGroup = getCustomColor('info')

  const background = c(scheme.background)
  const surfaceBase = c(scheme.surface)

  // Web elevation tuning (very subtle)
  const surface =
    mode === 'light'
      ? mix(background, '#000000', 2) // slightly darker than bg
      : mix(background, '#ffffff', 4) // slightly lighter than bg

  const surface1 =
    mode === 'light'
      ? mix(background, '#000000', 4)
      : mix(background, '#ffffff', 6)

  const surface2 =
    mode === 'light'
      ? mix(background, '#000000', 6)
      : mix(background, '#ffffff', 8)

  return {
    '--primary': c(scheme.primary),
    '--on-primary': c(scheme.onPrimary),
    '--primary-container': c(scheme.primaryContainer),
    '--on-primary-container': c(scheme.onPrimaryContainer),

    '--secondary': c(scheme.secondary),
    '--on-secondary': c(scheme.onSecondary),
    '--secondary-container': c(scheme.secondaryContainer),
    '--on-secondary-container': c(scheme.onSecondaryContainer),

    '--tertiary': c(scheme.tertiary),
    '--on-tertiary': c(scheme.onTertiary),
    '--tertiary-container': c(scheme.tertiaryContainer),
    '--on-tertiary-container': c(scheme.onTertiaryContainer),

    '--error': c(scheme.error),
    '--on-error': c(scheme.onError),
    '--error-container': c(scheme.errorContainer),
    '--on-error-container': c(scheme.onErrorContainer),

    // Custom Semantic Colors (derived)
    '--success': successGroup ? c(successGroup.color) : '#10b981',
    '--on-success': successGroup ? c(successGroup.onColor) : '#ffffff',
    '--success-container': successGroup
      ? c(successGroup.colorContainer)
      : '#d1fae5',
    '--on-success-container': successGroup
      ? c(successGroup.onColorContainer)
      : '#064e3b',

    '--warning': warningGroup ? c(warningGroup.color) : '#f59e0b',
    '--on-warning': warningGroup ? c(warningGroup.onColor) : '#ffffff',
    '--warning-container': warningGroup
      ? c(warningGroup.colorContainer)
      : '#fef3c7',
    '--on-warning-container': warningGroup
      ? c(warningGroup.onColorContainer)
      : '#78350f',

    '--info': infoGroup ? c(infoGroup.color) : '#38bdf8',
    '--on-info': infoGroup ? c(infoGroup.onColor) : '#ffffff',
    '--info-container': infoGroup ? c(infoGroup.colorContainer) : '#e0f2fe',
    '--on-info-container': infoGroup
      ? c(infoGroup.onColorContainer)
      : '#0c4a6e',

    '--background': background,
    '--on-background': c(scheme.onBackground),

    // ⬇️ Web-corrected surfaces
    '--surface': surface,
    '--surface-1': surface1,
    '--surface-2': surface2,

    '--on-surface': c(scheme.onSurface),
    '--surface-variant': c(scheme.surfaceVariant),
    '--on-surface-variant': c(scheme.onSurfaceVariant),

    '--outline': c(scheme.outline),
    '--outline-variant': c(scheme.outlineVariant),
  } as Record<string, string>
}

export function applyTheme(vars: Record<string, string>) {
  const root = document.documentElement

  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
}
