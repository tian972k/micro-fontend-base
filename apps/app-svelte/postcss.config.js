// Without this file Vite/Next never run Tailwind for this app, so classes
// used only inside the MFE were never generated.
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
