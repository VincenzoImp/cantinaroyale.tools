export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(() => {
try {
  const stored = localStorage.getItem("theme");
  const system = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const theme = stored === "light" || stored === "dark" ? stored : system;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document.documentElement.classList.toggle("dark", theme === "dark");
} catch {}
})();`,
      }}
    />
  );
}
