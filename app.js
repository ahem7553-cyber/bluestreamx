// BlueStreamX Local - Video Streaming App
// Config URL (ambil dari CDN asli)
const CONFIG_URL = 'https://cdn2.vid3y.vip/';

// State
let videos = [];
let currentPage = 1;
const videosPerPage = 12;
let filteredVideos = [];

// DOM Elements
const videoGrid = document.getElementById('videoGrid');
const searchInput = document.getElementById('searchInput');
const totalVideos = document.getElementById('totalVideos');
const pagination = document.getElementById('pagination');
const playerModal = document.getElementById('playerModal');
const playerTitle = document.getElementById('playerTitle');
const videoPlayer = document.getElementById('videoPlayer');
const downloadBtn = document.getElementById('downloadBtn');
const closePlayer = document.getElementById('closePlayer');
const refreshBtn = document.getElementById('refreshBtn');
const shareBtn = document.getElementById('shareBtn');

// Fetch config dari file local (sudah di-download)
async function fetchConfig() {
    try {
        // Coba dari file local dulu
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('File local tidak ditemukan');
        
        const config = await response.json();
        console.log('✅ Config loaded from local file');
        return config;
    } catch (error) {
        console.error('Error fetching config:', error);
        
        // Fallback: coba dari CDN (mungkin gagal karena CORS)
        try {
            const response = await fetch(CONFIG_URL);
            const html = await response.text();
            const match = html.match(/window\.APP_CONFIG = (\{.*?\});/s);
            if (match) {
                return JSON.parse(match[1]);
            }
        } catch (e) {
            console.error('Fallback juga gagal:', e);
        }
        
        return null;
    }
}

// Parse video data
function parseVideos(config) {
    const urls = config.videoContent?.urls || [];
    const titles = config.videoContent?.titles || [];
    
    const videoList = [];
    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        const title = titles[i] || `Video ${i + 1}`;
        const id = url.match(/\/([a-zA-Z0-9]+)\.mp4/)?.[1] || `video_${i}`;
        
        videoList.push({
            id,
            title,
            url,
            thumbnail: `https://picsum.photos/seed/${id}/640/360.jpg`, // Random thumbnail
            duration: Math.floor(Math.random() * 1800) + 60 // Random duration
        });
    }
    
    return videoList;
}

// Format duration
function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Render video card
function renderVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card bg-[#242526] rounded-lg overflow-hidden cursor-pointer border border-[#3e4042]';
    card.innerHTML = `
        <div class="relative">
            <img src="${video.thumbnail}" alt="${video.title}" 
                class="video-thumbnail w-full bg-[#3a3b3c]" loading="lazy">
            <span class="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs">
                ${formatDuration(video.duration)}
            </span>
        </div>
        <div class="p-3">
            <h3 class="text-sm font-medium line-clamp-2" title="${video.title}">${video.title}</h3>
            <p class="text-xs text-gray-400 mt-1">BlueStreamX</p>
        </div>
    `;
    
    card.addEventListener('click', () => playVideo(video));
    return card;
}

// Render videos
function renderVideos() {
    videoGrid.innerHTML = '';
    
    const start = (currentPage - 1) * videosPerPage;
    const end = start + videosPerPage;
    const videosToShow = filteredVideos.slice(start, end);
    
    if (videosToShow.length === 0) {
        videoGrid.innerHTML = `
            <div class="col-span-full text-center py-20 text-gray-400">
                <i class="fas fa-video-slash text-6xl mb-4"></i>
                <p>Tidak ada video ditemukan</p>
            </div>
        `;
        return;
    }
    
    videosToShow.forEach(video => {
        videoGrid.appendChild(renderVideoCard(video));
    });
    
    renderPagination();
}

// Render pagination
function renderPagination() {
    const totalPages = Math.ceil(filteredVideos.length / videosPerPage);
    pagination.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Prev button
    if (currentPage > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'px-4 py-2 bg-[#3a3b3c] rounded hover:bg-[#4a4b4c] transition';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.addEventListener('click', () => {
            currentPage--;
            renderVideos();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        pagination.appendChild(prevBtn);
    }
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `px-4 py-2 rounded transition ${i === currentPage 
                ? 'bg-blue-600 text-white' 
                : 'bg-[#3a3b3c] hover:bg-[#4a4b4c]'}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                renderVideos();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            pagination.appendChild(pageBtn);
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            const dots = document.createElement('span');
            dots.className = 'px-2 py-2';
            dots.textContent = '...';
            pagination.appendChild(dots);
        }
    }
    
    // Next button
    if (currentPage < totalPages) {
        const nextBtn = document.createElement('button');
        nextBtn.className = 'px-4 py-2 bg-[#3a3b3c] rounded hover:bg-[#4a4b4c] transition';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.addEventListener('click', () => {
            currentPage++;
            renderVideos();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        pagination.appendChild(nextBtn);
    }
}

// Play video
function playVideo(video) {
    playerTitle.textContent = video.title;
    videoPlayer.src = video.url;
    downloadBtn.href = video.url;
    downloadBtn.download = `${video.title}.mp4`;
    playerModal.classList.remove('hidden');
    playerModal.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

// Close player
function closePlayerModal() {
    playerModal.classList.add('hidden');
    playerModal.classList.remove('flex');
    videoPlayer.pause();
    videoPlayer.src = '';
    document.body.style.overflow = '';
}

// Search
function searchVideos(query) {
    const q = query.toLowerCase().trim();
    
    if (!q) {
        filteredVideos = [...videos];
    } else {
        filteredVideos = videos.filter(v => 
            v.title.toLowerCase().includes(q)
        );
    }
    
    currentPage = 1;
    renderVideos();
}

// Share
async function shareVideo() {
    const url = videoPlayer.src;
    const title = playerTitle.textContent;
    
    if (navigator.share) {
        try {
            await navigator.share({ title, url });
        } catch (err) {
            copyToClipboard(url);
        }
    } else {
        copyToClipboard(url);
    }
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Link berhasil disalin!');
    });
}

// Initialize
async function init() {
    videoGrid.innerHTML = `
        <div class="col-span-full text-center py-20">
            <i class="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
            <p class="text-gray-400">Memuat video...</p>
        </div>
    `;
    
    const config = await fetchConfig();
    
    if (!config) {
        videoGrid.innerHTML = `
            <div class="col-span-full text-center py-20 text-red-400">
                <i class="fas fa-exclamation-triangle text-6xl mb-4"></i>
                <p>Gagal memuat data video</p>
                <button onclick="init()" class="mt-4 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg">
                    Coba Lagi
                </button>
            </div>
        `;
        return;
    }
    
    videos = parseVideos(config);
    filteredVideos = [...videos];
    
    totalVideos.textContent = `${videos.length} video`;
    
    renderVideos();
    
    console.log(`✅ Loaded ${videos.length} videos from BlueStreamX`);
}

// Event Listeners
searchInput.addEventListener('input', (e) => searchVideos(e.target.value));
closePlayer.addEventListener('click', closePlayerModal);
playerModal.addEventListener('click', (e) => {
    if (e.target === playerModal) closePlayerModal();
});
refreshBtn.addEventListener('click', () => {
    videos = [];
    filteredVideos = [];
    init();
});
shareBtn.addEventListener('click', shareVideo);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !playerModal.classList.contains('hidden')) {
        closePlayerModal();
    }
});

// Start
init();
