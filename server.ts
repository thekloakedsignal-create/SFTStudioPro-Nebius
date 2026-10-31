import express from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import { createServer as createViteServer } from "vite";

const app = express();
const port = Number(process.env.PORT || 3000);

async function startServer() {
  if (process.env.NODE_ENV === "production") {
    const distPathCandidates = [
      path.join(process.cwd(), "artifacts", "sft-studio-pro-2", "dist"),
      path.join(process.cwd(), "dist"),
    ];
    const distPath = distPathCandidates.find((candidate) =>
      existsSync(path.join(candidate, "index.html")),
    );
    if (!distPath) {
      throw new Error(
        `Production build index.html not found. Checked: ${distPathCandidates.join(", ")}`,
      );
    }

    app.use(express.static(distPath));
    app.use((req, res, next) => {
      if (req.method === "GET" && req.accepts("html")) {
        return res.sendFile(path.join(distPath, "index.html"));
      }
      next();
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(port, "0.0.0.0", () => {
    console.info(`SFT Studio web server listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error("SFT Studio web server failed to start:", error);
  process.exit(1);
});