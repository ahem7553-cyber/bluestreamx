// BlueStreamX - Cloudflare Worker
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };
    
    // Handle OPTIONS
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Fetch config from CDN
    if (url.pathname === '/api/videos' || url.pathname === '/') {
      try {
        const response = await fetch('https://cdn2.vid3y.vip/');
        const html = await response.text();
        
        // Extract APP_CONFIG
        const match = html.match(/window\.APP_CONFIG = (\{.*?\});/s);
        if (match) {
          const config = JSON.parse(match[1]);
          const videos = [];
          const urls = config.videoContent?.urls || [];
          const titles = config.videoContent?.titles || [];
          
          for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            const title = titles[i % titles.length] || `Video ${i + 1}`;
            const id = url.match(/\/([a-zA-Z0-9]+)\.mp4/)?.[1] || `video_${i}`;
            
            videos.push({
              id,
              title,
              url,
              thumbnail: `https://picsum.photos/seed/${id}/640/360.jpg`,
              duration: Math.floor(Math.random() * 1800) + 60
            });
          }
          
          return new Response(JSON.stringify({
            success: true,
            total: videos.length,
            videos
          }), { headers: corsHeaders });
        }
        
        return new Response(JSON.stringify({ error: 'Config not found' }), {
          status: 500,
          headers: corsHeaders
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }
    
    // Serve HTML page
    const htmlPage = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BlueStreamX - Video Streaming</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Russo+One&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        :root { --dark-bg: #18191a; --dark-card-bg: #242526; --dark-text: #e4e6eb; --dark-border: #3e4042; }
        body { background-color: var(--dark-bg); color: var(--dark-text); font-family: 'Inter', sans-serif; }
        .brand-title { font-family: 'Russo One', sans-serif; }
        .video-card:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .video-card { transition: all 0.3s ease; }
        .video-thumbnail { aspect-ratio: 16/9; object-fit: cover; }
    </style>
</head>
<body class="min-h-screen">
    <header class="bg-[#242526] border-b border-[#3e4042] shadow-lg sticky top-0 z-50">
        <div class="container mx-auto px-4 py-3 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <h1 class="brand-title text-xl text-blue-500">BlueStreamX</h1>
            </div>
            <div class="flex items-center gap-4">
                <input type="text" id="searchInput" placeholder="Cari video..." class="bg-[#3a3b3c] text-white px-4 py-2 rounded-full border-none outline-none w-64">
                <span id="totalVideos" class="text-sm text-gray-400"></span>
            </div>
        </div>
    </header>
    <main class="container mx-auto px-4 py-8">
        <div class="mb-6"><h2 class="text-2xl font-bold">Video Terbaru</h2></div>
        <div id="videoGrid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"></div>
        <div id="pagination" class="flex justify-center gap-2 mt-8"></div>
    </main>
    <div id="playerModal" class="fixed inset-0 bg-black/90 z-50 hidden items-center justify-center p-4">
        <div class="bg-[#242526] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div class="p-4 border-b border-[#3e4042] flex justify-between items-center">
                <h3 id="playerTitle" class="text-lg font-semibold truncate"></h3>
                <button id="closePlayer" class="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>
            <div class="aspect-video bg-black">
                <video id="videoPlayer" controls class="w-full h-full" autoplay></video>
            </div>
            <div class="p-4 flex gap-3">
                <a id="downloadBtn" href="#" download class="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded-lg text-center transition">
                    <i class="fas fa-download mr-2"></i>Download
                </a>
            </div>
        </div>
    </div>
    <script>
        let videos = [], filteredVideos = [], currentPage = 1;
        const videosPerPage = 20;
        const videoGrid = document.getElementById('videoGrid');
        const searchInput = document.getElementById('searchInput');
        const totalVideos = document.getElementById('totalVideos');
        const pagination = document.getElementById('pagination');
        const playerModal = document.getElementById('playerModal');
        const playerTitle = document.getElementById('playerTitle');
        const videoPlayer = document.getElementById('videoPlayer');
        const downloadBtn = document.getElementById('downloadBtn');
        const closePlayer = document.getElementById('closePlayer');
        
        function formatDuration(s) { return Math.floor(s/60) + ':' + (s%60).toString().padStart(2,'0'); }
        
        function renderVideoCard(v) {
            const c = document.createElement('div');
            c.className = 'video-card bg-[#242526] rounded-lg overflow-hidden cursor-pointer border border-[#3e4042]';
            c.innerHTML = '<div class="relative"><img src="'+v.thumbnail+'" class="video-thumbnail w-full bg-[#3a3b3c]" loading="lazy"><span class="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs">'+formatDuration(v.duration)+'</span></div><div class="p-3"><h3 class="text-sm font-medium line-clamp-2">'+v.title+'</h3></div>';
            c.addEventListener('click', () => playVideo(v));
            return c;
        }
        
        function renderVideos() {
            videoGrid.innerHTML = '';
            const start = (currentPage - 1) * videosPerPage;
            const vids = filteredVideos.slice(start, start + videosPerPage);
            if (!vids.length) { videoGrid.innerHTML = '<div class="col-span-full text-center py-20 text-gray-400"><p>Tidak ada video</p></div>'; return; }
            vids.forEach(v => videoGrid.appendChild(renderVideoCard(v)));
            renderPagination();
        }
        
        function renderPagination() {
            const pages = Math.ceil(filteredVideos.length / videosPerPage);
            pagination.innerHTML = '';
            if (pages <= 1) return;
            for (let i = 1; i <= Math.min(pages, 10); i++) {
                const b = document.createElement('button');
                b.className = 'px-4 py-2 rounded ' + (i === currentPage ? 'bg-blue-600' : 'bg-[#3a3b3c]');
                b.textContent = i;
                b.onclick = () => { currentPage = i; renderVideos(); };
                pagination.appendChild(b);
            }
        }
        
        function playVideo(v) {
            playerTitle.textContent = v.title;
            videoPlayer.src = v.url;
            downloadBtn.href = v.url;
            playerModal.classList.remove('hidden');
            playerModal.classList.add('flex');
        }
        
        closePlayer.onclick = () => { playerModal.classList.add('hidden'); videoPlayer.pause(); };
        searchInput.oninput = (e) => {
            const q = e.target.value.toLowerCase();
            filteredVideos = q ? videos.filter(v => v.title.toLowerCase().includes(q)) : [...videos];
            currentPage = 1;
            renderVideos();
        };
        
        async function init() {
            videoGrid.innerHTML = '<div class="col-span-full text-center py-20"><i class="fas fa-spinner fa-spin text-4xl text-blue-500"></i><p class="text-gray-400 mt-4">Memuat video...</p></div>';
            try {
                const res = await fetch('/api/videos');
                const data = await res.json();
                videos = data.videos;
                filteredVideos = [...videos];
                totalVideos.textContent = videos.length + ' video';
                renderVideos();
            } catch(e) {
                videoGrid.innerHTML = '<div class="col-span-full text-center py-20 text-red-400"><p>Gagal memuat video: '+e.message+'</p></div>';
            }
        }
        
        init();
    </script>
</body>
</html>`;
    
    return new Response(htmlPage, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
};
