// tunnel.mjs
import { startTunnel } from "untun";

console.log("Sedang membuat terowongan Cloudflare aman (WSS)...");

try {
  const tunnel = await startTunnel({ port: 8080 });
  const httpsUrl = await tunnel.getURL();
  const wssUrl = httpsUrl.replace("https://", "wss://");

  console.log("\n=======================================================");
  console.log("\x1b[32m[BERHASIL]\x1b[0m Terowongan aktif!");
  console.log("Salin link ini dan masukkan ke kotak website Anda:");
  console.log(`\x1b[36m${wssUrl}\x1b[0m`);
  console.log("=======================================================\n");
} catch (err) {
  console.error("Gagal membuat tunnel:", err);
}