import { useEffect } from "react";

/**
 * Hook to enable scrollbar expansion on hover for scrollable containers
 * Adds 'scrollbar-expanded' class when hovering over element
 * @param {string} selector - CSS selector for the scrollable element(s)
 */
export const useScrollbarExpand = (selector = ".profile-sidebar, .scrollbar-expandable") => {
  useEffect(() => {
    const elements = document.querySelectorAll(selector);

    const handleMouseEnter = (el) => () => el.classList.add("scrollbar-expanded");
    const handleMouseLeave = (el) => () => el.classList.remove("scrollbar-expanded");

    elements.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter(el));
      el.addEventListener("mouseleave", handleMouseLeave(el));
    });

    return () => {
      elements.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter(el));
        el.removeEventListener("mouseleave", handleMouseLeave(el));
      });
    };
  }, [selector]);
};

export default useScrollbarExpand;
