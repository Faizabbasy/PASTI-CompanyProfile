const mobileMenuOpen = ref(false)

/**
 * Shared open/close state for the mobile navigation overlay.
 * Kept outside the Header component tree so the fixed-position overlay
 * can render as a sibling of `<header>` rather than nested inside its
 * `position: sticky` containing block.
 */
export function useMobileMenu() {
  function open() {
    mobileMenuOpen.value = true
  }

  function close() {
    mobileMenuOpen.value = false
  }

  function toggle() {
    mobileMenuOpen.value = !mobileMenuOpen.value
  }

  return { isOpen: mobileMenuOpen, open, close, toggle }
}
