export function getAltKeyLabel(): string {
  if (typeof navigator === 'undefined') return 'Alt'
  // Mac detection
  if (navigator.platform.toUpperCase().indexOf('MAC') >= 0) {
    return '⌥'
  }
  return 'Alt'
}
