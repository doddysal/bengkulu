require("dotenv").config();
const path = require("path");
const express = require("express");
const helmet = require("helmet");

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(express.json({ limit: "1mb" }));

app.get("/api/status", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.json({ aktif: true, port, waktu: new Date().toISOString() });
});

app.get("/api/konfigurasi-publik", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.json({
    supabaseUrl: process.env.SUPABASE_URL || "",
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    cloudinaryUploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || "",
    cloudinaryFolder: process.env.CLOUDINARY_FOLDER || "pmi-bengkulu",
    maxUploadMb: Number(process.env.MAX_UPLOAD_MB || 3)
  });
});

// Gunakan process.cwd() alih-alih __dirname
app.use(express.static(process.cwd(), {
  extensions: ["html"],
  etag: true,
  maxAge: process.env.NODE_ENV === "production" ? "1h" : 0
}));

app.get("*", (req, res) => {
  res.status(404).sendFile(path.join(process.cwd(), "index.html"));
});

if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`PMI Kota Bengkulu aktif: http://localhost:${port}`);
    console.log(`Status server: http://localhost:${port}/api/status`);
  });
}
module.exports = app;