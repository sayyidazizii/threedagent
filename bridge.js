// bridge.js - Menghubungkan Browser Netlify ke Terminal Lokal Anda
const WebSocket = require('ws');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const PORT = 8080;
const wss = new WebSocket.Server({ port: PORT });

console.log(`\x1b[32m[AKTIF]\x1b[0m Bridge Server berjalan di port: ${PORT}`);
console.log(`Menunggu instruksi dari browser Netlify...\n`);

wss.on('connection', (ws) => {
  console.log(`\x1b[36m[CONNECTED]\x1b[0m Web Dashboard terhubung!`);

  ws.on('message', (raw) => {
    try {
      const data = JSON.parse(raw);

      if (data.type === 'RUN_TASK') {
        const { cliTool, projectPath, prompt } = data;
        console.log(`\n================================`);
        console.log(`Memulai Task Baru:`);
        console.log(`Engine CLI : ${cliTool}`);
        console.log(`Direktori  : ${projectPath}`);
        console.log(`Prompt     : ${prompt}`);
        console.log(`================================\n`);

        // Validasi folder lokal
        if (!fs.existsSync(projectPath)) {
          ws.send(JSON.stringify({
            state: 'resting',
            emoji: '❌',
            bubbleText: 'Folder path tidak ditemukan!'
          }));
          return;
        }

        // Pindahkan agent ke stasiun meja (Kerja)
        ws.send(JSON.stringify({
          state: 'working',
          emoji: '💻',
          bubbleText: `[${cliTool}] Memulai eksekusi task...`
        }));

        // Jalankan perintah CLI di direktori target
        // Sesuaikan argumen sesuai CLI Anda (contoh: "opencode run <prompt>")
        const child = spawn(cliTool, ['run', prompt], {
          cwd: path.resolve(projectPath),
          shell: true
        });

        child.stdout.on('data', (chunk) => {
          const log = chunk.toString().trim();
          console.log(`[${cliTool}]:`, log);

          // Ambil baris terakhir terminal untuk dipajang di balon bicara
          const lastLine = log.split('\n').filter(Boolean).pop();
          if (lastLine) {
            ws.send(JSON.stringify({
              state: 'working',
              emoji: '⚡',
              bubbleText: lastLine.slice(0, 32)
            }));
          }
        });

        child.stderr.on('data', (err) => {
          console.error(`[ERR]:`, err.toString());
        });

        child.on('close', (code) => {
          console.log(`\nTask selesai dengan status code: ${code}`);
          // Setelah selesai, agent berjalan ke sofa santai
          ws.send(JSON.stringify({
            state: 'resting',
            emoji: '🛋️',
            bubbleText: 'Selesai! Sedang rehat di sofa.'
          }));
        });
      }
    } catch (err) {
      console.error("Gagal membaca payload:", err);
    }
  });
});
