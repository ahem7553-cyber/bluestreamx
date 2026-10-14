# BlueStreamX - Video Streaming Web App

Web aplikasi streaming video dengan tampilan modern dan dark mode.

## Fitur

- 3668 video tersedia (real-time fetch dari CDN)
- Video streaming dengan player
- Pencarian video
- Download video
- Dark mode UI
- Responsive design
- Cloudflare Workers support

## Cara Deploy ke Cloudflare Workers

### 1. Login ke Cloudflare Dashboard
```
https://dash.cloudflare.com
```

### 2. Buat Worker Baru
- Klik **Workers & Pages**
- Klik **Create Application** → **Create Worker**
- Beri nama: `bluestreamx`
- Klik **Deploy**

### 3. Edit Kode Worker
- Klik **Edit code**
- Copy semua isi file `worker.js`
- Paste ke editor Cloudflare
- Klik **Save and Deploy**

### 4. Akses Aplikasi
Worker akan aktif di:
```
https://bluestreamx.[your-subdomain].workers.dev
```

## API Endpoint

### GET /
Halaman utama dengan video grid

### GET /api/videos
Mengembalikan JSON dengan daftar semua video

**Response:**
```json
{
  "success": true,
  "total": 3668,
  "videos": [
    {
      "id": "VIDEO_ID",
      "title": "Judul Video",
      "url": "https://cdn.slicedrive.com/VIDEO_ID.mp4",
      "thumbnail": "https://picsum.photos/seed/ID/640/360.jpg",
      "duration": 1200
    }
  ]
}
```

## Teknologi

- HTML5 + Tailwind CSS (CDN)
- Vanilla JavaScript
- Cloudflare Workers (Edge Computing)

## Struktur File

```
bluestreamx/
├── index.html     # Halaman utama
├── app.js         # Logic frontend
├── worker.js      # Cloudflare Worker code
└── README.md      # Dokumentasi
```

## Catatan

- Data video diambil secara real-time dari CDN
- Tidak memerlukan database
- Worker berjalan di edge Cloudflare (super cepat)

## License

MIT
