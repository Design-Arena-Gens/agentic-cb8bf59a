import { useEffect, useState } from "react";

const darkClass = "dark";

export const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    const storedPreference = window.localStorage.getItem("builder:theme");

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = storedPreference ? storedPreference === "dark" : prefersDark;
    setIsDark(initial);
    root.classList.toggle(darkClass, initial);
  }, []);

  const toggle = () => {
    setIsDark((prev) => {
      const next = !prev;
      const root = window.document.documentElement;
      root.classList.toggle(darkClass, next);
      window.localStorage.setItem("builder:theme", next ? "dark" : "light");
      return next;
    });
  };

  return [isDark, toggle] as const;
};
