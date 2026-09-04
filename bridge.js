// bridge.js - Menghubungkan Browser Dashboard ke Terminal Lokal Anda (Auto-Workspace Lock)
const WebSocket = require('ws');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const PORT = 8080;
const wss = new WebSocket.Server({ port: PORT });

console.log(`\x1b[32m[AKTIF]\x1b[0m Bridge Server dinamis berjalan di port: ${PORT}`);
console.log(`Menunggu instruksi dari web dashboard...\n`);

wss.on('connection', (ws) => {
  console.log(`\x1b[36m[CONNECTED]\x1b[0m Web Dashboard terhubung!`);

  ws.on('message', (raw) => {
    try {
      const data = JSON.parse(raw);

      if (data.type === 'RUN_TASK') {
        const execCmd = (data.customCmd || data.cliTool || 'agy').trim();
        const projectPath = (data.projectPath || '').trim();
        const rawPrompt = (data.prompt || '').trim();

        // 1. Bersihkan tanda kutip ganda yang tidak sengaja terketik di awal/akhir prompt
        const cleanPrompt = rawPrompt.replace(/^["']|["']$/g, '').trim();

        console.log(`\n========================================`);
        console.log(`Command CLI : \x1b[33m${execCmd}\x1b[0m`);
        console.log(`Direktori   : \x1b[34m${projectPath}\x1b[0m`);
        console.log(`Prompt Asli : "${cleanPrompt}"`);
        console.log(`========================================\n`);

        // 2. Validasi keberadaan folder lokal
        if (!fs.existsSync(projectPath)) {
          console.error(`\x1b[31m[ERROR]\x1b[0m Folder tidak ditemukan: ${projectPath}`);
          ws.send(JSON.stringify({
            state: 'resting',
            emoji: '❌',
            bubbleText: 'Error: Folder tidak ditemukan!'
          }));
          return;
        }

        // 3. Pindahkan avatar 3D ke meja kerja
        ws.send(JSON.stringify({
          state: 'working',
          emoji: '💻',
          bubbleText: `[${execCmd.split(' ')[0]}] Sedang bekerja...`
        }));

        // 4. Pastikan Antigravity mengunci workspace ke folder project Anda (bukan scratchpad)
        let finalCmd = execCmd;
        const normalizedPath = projectPath.replace(/\\/g, '/');

        if (finalCmd.startsWith('agy') && !finalCmd.includes('--add-dir')) {
          if (finalCmd.includes(' -p')) {
            finalCmd = finalCmd.replace(' -p', ` --add-dir "${normalizedPath}" -p`);
          } else {
            finalCmd = `${finalCmd} --add-dir "${normalizedPath}"`;
          }
        }

        // 5. Tambahkan instruksi tegas agar file disimpan di folder proyek
        const enforcedPrompt = `${cleanPrompt}. Simpan atau ubah file langsung di dalam folder: ${normalizedPath}`;
        const safePrompt = enforcedPrompt.replace(/"/g, '\\"');
        const fullCommand = `${finalCmd} "${safePrompt}"`;

        console.log(`Menjalankan di terminal: \x1b[36m${fullCommand}\x1b[0m\n`);

        // Eksekusi proses di terminal lokal
        const child = spawn(fullCommand, {
          cwd: path.resolve(projectPath),
          shell: true
        });

        // 6. Tangkap output terminal secara realtime
        child.stdout.on('data', (chunk) => {
          const log = chunk.toString().trim();
          console.log(`[OUT]:`, log);

          // Update teks balon bicara di atas kepala avatar
          const lastLine = log.split('\n').map(l => l.trim()).filter(Boolean).pop();
          if (lastLine) {
            ws.send(JSON.stringify({
              state: 'working',
              emoji: '⚡',
              bubbleText: lastLine.slice(0, 32)
            }));
          }
        });

        child.stderr.on('data', (err) => {
          const errText = err.toString().trim();
          console.error(`\x1b[31m[STDERR]:\x1b[0m`, errText);
        });

        // 7. Ketika proses selesai
        child.on('close', (code) => {
          console.log(`\nTask selesai dengan status code: ${code}`);

          if (code === 0) {
            ws.send(JSON.stringify({
              state: 'resting',
              emoji: '🛋️',
              bubbleText: 'Task selesai! Santai di sofa ☕'
            }));
          } else {
            ws.send(JSON.stringify({
              state: 'resting',
              emoji: '⚠️',
              bubbleText: `Selesai dengan status: ${code}`
            }));
          }
        });

        child.on('error', (err) => {
          console.error(`\x1b[31m[FAILED]:\x1b[0m Gagal mengeksekusi:`, err);
          ws.send(JSON.stringify({
            state: 'resting',
            emoji: '❌',
            bubbleText: 'Gagal menjalankan perintah!'
          }));
        });
      }
    } catch (err) {
      console.error("Gagal membaca payload:", err);
    }
  });
});