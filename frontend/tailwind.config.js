/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "outline-variant": "#424754",
        "tertiary-container": "#df7412",
        "on-secondary-fixed": "#001e2f",
        "on-primary-container": "#00285d",
        "secondary-container": "#00a2e6",
        "tertiary": "#ffb786",
        "surface-container-low": "#151b2d",
        "on-error": "#690005",
        "surface-container-high": "#23293c",
        "on-background": "#dce1fb",
        "primary-container": "#4d8eff",
        "on-tertiary-fixed": "#311400",
        "secondary-fixed": "#c9e6ff",
        "error-container": "#93000a",
        "surface-container-highest": "#2e3447",
        "surface-dim": "#0c1324",
        "secondary": "#89ceff",
        "inverse-surface": "#dce1fb",
        "secondary-fixed-dim": "#89ceff",
        "on-error-container": "#ffdad6",
        "on-tertiary": "#502400",
        "on-secondary-container": "#00344e",
        "surface-tint": "#adc6ff",
        "outline": "#8c909f",
        "surface-variant": "#2e3447",
        "background": "#0c1324",
        "inverse-on-surface": "#2a3043",
        "on-surface": "#dce1fb",
        "primary-fixed": "#d8e2ff",
        "primary-fixed-dim": "#adc6ff",
        "inverse-primary": "#005ac2",
        "surface-bright": "#33394c",
        "tertiary-fixed": "#ffdcc6",
        "on-tertiary-fixed-variant": "#723600",
        "error": "#ffb4ab",
        "on-primary-fixed-variant": "#004395",
        "primary": "#adc6ff",
        "on-primary": "#002e6a",
        "surface-container": "#191f31",
        "on-surface-variant": "#c2c6d6",
        "on-tertiary-container": "#461f00",
        "surface-container-lowest": "#070d1f",
        "tertiary-fixed-dim": "#ffb786",
        "surface": "#0c1324",
        "on-secondary-fixed-variant": "#004c6e",
        "on-secondary": "#00344d",
        "on-primary-fixed": "#001a42"
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      spacing: {
        "margin-desktop": "32px",
        "container-max": "1440px",
        "unit": "4px",
        "gutter": "24px",
        "margin-mobile": "16px"
      },
      fontFamily: {
        "label-mono": ["JetBrains Mono"],
        "display": ["Geist"],
        "headline-md": ["Geist"],
        "body-lg": ["Geist"],
        "headline-lg-mobile": ["Geist"],
        "headline-lg": ["Geist"],
        "body-sm": ["Geist"]
      },
      fontSize: {
        "label-mono": ["12px", { "lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "500" }],
        "display": ["48px", { "lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "600" }],
        "headline-md": ["24px", { "lineHeight": "1.3", "fontWeight": "500" }],
        "body-lg": ["16px", { "lineHeight": "1.6", "fontWeight": "400" }],
        "headline-lg-mobile": ["24px", { "lineHeight": "1.2", "fontWeight": "600" }],
        "headline-lg": ["32px", { "lineHeight": "1.2", "letterSpacing": "-0.01em", "fontWeight": "500" }],
        "body-sm": ["14px", { "lineHeight": "1.5", "fontWeight": "400" }]
      }
    }
  },
  plugins: [],
}
