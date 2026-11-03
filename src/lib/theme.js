export const THEME_STORAGE_KEY = "playon-theme";

// Runs in <head> before the page paints, so a saved dark theme never flashes
// light first. Kept tiny and wrapped in try/catch: storage can be blocked.
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}var r=document.documentElement;r.classList.toggle("dark",t==="dark");r.style.colorScheme=t}catch(e){}})();`;
