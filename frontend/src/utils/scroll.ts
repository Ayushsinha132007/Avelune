/**
 * Smoothly scrolls to a target DOM element with an offset to account for sticky navigation.
 * Also updates URL hash if desired without jumping.
 */
export function scrollToSection(sectionId: string, offset: number = 80): boolean {
  // Strip '#' if provided
  const cleanId = sectionId.startsWith('#') ? sectionId.substring(1) : sectionId;
  const element = document.getElementById(cleanId);
  
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: Math.max(0, offsetPosition),
      behavior: 'smooth',
    });
    return true;
  }
  return false;
}

