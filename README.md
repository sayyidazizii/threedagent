# AI Office - 3D Remote Agent Dashboard

Aplikasi visualisasi kantor virtual 3D interaktif yang menghubungkan Web Dashboard (Three.js) dengan terminal CLI lokal (seperti Antigravity `agy`, Claude Code, Aider, atau custom CLI lainnya) melalui WebSocket Bridge Server.

Avatar 3D di dalam dashboard akan merespons secara visual: berpindah ke meja kerja dan mengetik saat CLI bekerja, serta kembali ke sofa santai saat tugas selesai.

---

## 🎥 Demo Preview

https://github.com/user-attachments/assets/32fcec39-21fb-4abe-8686-f32100da30bb

## 🚀 Fitur Utama

- **Visualisasi 3D Interaktif (Three.js)**: Lingkungan kantor virtual isometrik/3D lengkap dengan meja kerja, komputer, monitor, sofa, dan avatar agen AI.
- **WebSocket Bridge (`bridge.js`)**: Jembatan komunikasi real-time antara antarmuka web dan terminal lokal komputer Anda.
- **Auto-Workspace Lock**: Memastikan tugas CLI dijalankan tepat di direktori proyek yang ditentukan (`--add-dir` flag untuk `agy`).
- **Realtime Status & Bubble Chat**: Output CLI terminal ditampilkan secara langsung di atas kepala avatar sebagai balon dialog (*speech bubble*).
- **Akses Remote via Cloudflare Tunnel (`tunnel.mjs`)**: Mendukung koneksi WSS aman dari browser jarak jauh/eksternal tanpa port forwarding manual.

---

## 📁 Struktur File

```text
threedagent/
├── index.html          # Web dashboard visual 3D & kontrol task
├── bridge.js           # WebSocket server lokal pengeksekusi CLI (Port 8080)
├── tunnel.mjs          # Tunnel Cloudflare publik (WSS) menggunakan untun
├── package.json        # Dependensi Node.js (ws, untun)
└── README.md           # Dokumentasi proyek
```

---

## 🛠️ Persyaratan Sistem

- [Node.js](https://nodejs.org/) versi 18 atau lebih baru.
- CLI Tool yang ingin digunakan terpasang di sistem (contoh: `agy` Antigravity CLI, Claude Code, dll).

---

## 📦 Instalasi

1. Buka terminal di direktori proyek:
   ```bash
   cd "D:/PROJECT TESTING/threedagent"
   ```

2. Pasang dependensi yang diperlukan:
   ```bash
   npm install
   ```

---

## 🖥️ Cara Penggunaan

### 1. Menjalankan WebSocket Bridge Lokal
Jalankan bridge server di terminal lokal:
```bash
node bridge.js
```
Server akan berjalan dan mendengarkan koneksi di `ws://localhost:8080`.

### 2. (Opsional) Mengaktifkan Remote WSS Tunnel
Jika Anda mengakses web dashboard dari perangkat lain / jaringan luar:
```bash
node tunnel.mjs
```
Salin URL WebSocket yang dihasilkan (`wss://....trycloudflare.com`) ke input server di dashboard web.

### 3. Membuka Dashboard Web
- Buka file `index.html` langsung di browser Anda atau jalankan melalui live server:
  ```bash
  npx serve .
  ```
- Hubungkan ke WebSocket (`ws://localhost:8080` atau URL tunnel WSS).
- Tentukan:
  - **Tool CLI**: `agy`, `claude`, atau custom command.
  - **Direktori Proyek**: Path absolut folder kerja lokal tujuan.
  - **Prompt / Instruksi**: Perintah yang ingin dijalankan oleh agen AI.
- Tekan **Kirim Instruksi** dan amati avatar 3D bekerja di mejanya.

---

## ⚙️ Konfigurasi & Kustomisasi

- **Port WebSocket**: Secara default menggunakan port `8080` di `bridge.js`. Anda dapat mengubah konstanta `PORT` jika diperlukan.
- **Kamera & Grafis**: Konfigurasi pencahayaan, posisi kamera, dan animasi avatar 3D dapat disesuaikan di `index.html`.

---

## 📄 Lisensi

ISC License.
