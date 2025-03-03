import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // server: {
  //   host: "0.0.0.0", // 👈 Ensure it binds to all network interfaces
  //   port:  3000, // 👈 Use Render's port
  // },
});
