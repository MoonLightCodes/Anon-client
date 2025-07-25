import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  preview: {
    port: process.env.PORT || 5173,
    host: true,
    allowedHosts: ["anon-pfti.onrender.com"], // 👈 Add this line
  },
});
