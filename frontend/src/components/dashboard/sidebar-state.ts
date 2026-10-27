import { useSyncExternalStore } from "react";

const KEY = "jt_sidebar_collapsed";
const EVENT = "jt-sidebar-collapsed";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

function getSnapshot() {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

/** Desktop sidebar collapsed state, remembered in localStorage (expanded on the server). */
export function useSidebarCollapsed() {
  const collapsed = useSyncExternalStore(subscribe, getSnapshot, () => false);

  const setCollapsed = (value: boolean) => {
    try {
      localStorage.setItem(KEY, value ? "1" : "0");
    } catch {
      // Storage unavailable (private mode etc.): the toggle just won't persist.
    }
    window.dispatchEvent(new Event(EVENT));
  };

  return [collapsed, setCollapsed] as const;
}
