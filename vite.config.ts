import { defineConfig } from "vite";
import { unstable_reactRouterRSC as reactRouterRSC } from "@react-router/dev/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import rsc from "@vitejs/plugin-rsc";

export default defineConfig({
  logLevel: "info",
  plugins: [
    ...cloudflare({
      configPath: "./wrangler.jsonc",
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
    reactRouterRSC(),
    rsc(),
  ],
  environments: {
    rsc: {
      optimizeDeps: {
        noDiscovery: false,
        include: ["react", "react-dom", "react-router"],
      },
    },
    ssr: {
      optimizeDeps: {
        noDiscovery: false,
        include: ["react", "react-dom", "react-router"],
      },
    },
  },
});
