/**
 * BlueStreamX - Premium Video Streaming App
 * Modern, Professional, Elegant Design
 */

// ========== Configuration ==========
const CONFIG = {
    cdnUrl: 'https://cdn2.vid3y.vip/',
    videosPerPage: 24,
    debounceTime: 300,
    animationDelay: 50
};

// ========== State Management ==========
const state = {
    videos: [],
    filteredVideos: [],
    currentPage: 1,
    isLoading: false,
    searchQuery: '',
    sortBy: 'newest',
    viewMode: 'grid'
};

// ========== DOM Elements ==========
const elements = {
    videoGrid: document.getElementById('videoGrid'),
    searchInput: document.getElementById('searchInput'),
    searchInputMobile: document.getElementById('searchInputMobile'),
    totalVideosCount: document.getElementById('totalVideosCount'),
    pagination: document.getElementById('pagination'),
    paginationContainer: document.getElementById('paginationContainer'),
    loadMoreContainer: document.getElementById('loadMoreContainer'),
    loadMoreBtn: document.getElementById('loadMoreBtn'),
    sortSelect: document.getElementById('sortSelect'),
    playerModal: document.getElementById('playerModal'),
    modalBackdrop: document.getElementById('modalBackdrop'),
    playerTitle: document.getElementById('playerTitle'),
    videoPlayer: document.getElementById('videoPlayer'),
    downloadBtn: document.getElementById('downloadBtn'),
    closePlayer: document.getElementById('closePlayer'),
    playerLoading: document.getElementById('playerLoading'),
    toastContainer: document.getElementById('toastContainer'),
    gridView: document.getElementById('gridView'),
    listView: document.getElementById('listView'),
    categoryBtns: document.querySelectorAll('.category-btn'),
    likeBtn: document.getElementById('likeBtn'),
    shareBtn: document.getElementById('shareBtn'),
    bookmarkBtn: document.getElementById('bookmarkBtn')
};

// ========== Utility Functions ==========
const utils = {
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    formatDuration(seconds) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    },

    slugify(text) {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    },

    getRandomViews() {
        return Math.floor(Math.random() * 500000) + 1000;
    },

    showLoading() {
        state.isLoading = true;
    },

    hideLoading() {
        state.isLoading = false;
    }
};

// ========== Toast Notifications ==========
const toast = {
    show(message, type = 'info', duration = 3000) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            warning: 'fa-exclamation-circle',
            info: 'fa-info-circle'
        };
        
        const colors = {
            success: 'from-green-500 to-emerald-600',
            error: 'from-red-500 to-rose-600',
            warning: 'from-yellow-500 to-orange-600',
            info: 'from-blue-500 to-indigo-600'
        };

        const toastEl = document.createElement('div');
        toastEl.className = `toast flex items-center gap-3 px-5 py-3 rounded-xl glass border border-white/10 shadow-lg`;
        toastEl.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-gradient-to-br ${colors[type]} flex items-center justify-center flex-shrink-0">
                <i class="fas ${icons[type]} text-white text-sm"></i>
            </div>
            <p class="text-sm">${message}</p>
        `;

        elements.toastContainer.appendChild(toastEl);

        setTimeout(() => {
            toastEl.style.opacity = '0';
            toastEl.style.transform = 'translateX(100%)';
            toastEl.style.transition = 'all 0.3s ease';
            setTimeout(() => toastEl.remove(), 300);
        }, duration);
    },

    success(message) { this.show(message, 'success'); },
    error(message) { this.show(message, 'error'); },
    warning(message) { this.show(message, 'warning'); },
    info(message) { this.show(message, 'info'); }
};

// ========== API Functions ==========
async function fetchConfig() {
    try {
        const response = await fetch(CONFIG.cdnUrl);
        const html = await response.text();
        
        const match = html.match(/window\.APP_CONFIG = (\{.*?\});/s);
        if (match) {
            return JSON.parse(match[1]);
        }
        throw new Error('Config tidak ditemukan');
    } catch (error) {
        console.error('Error fetching config:', error);
        return null;
    }
}

function parseVideos(config) {
    const urls = config.videoContent?.urls || [];
    const titles = config.videoContent?.titles || [];
    
    const videoList = [];
    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        const title = titles[i % titles.length] || `Video Premium ${i + 1}`;
        const id = url.match(/\/([a-zA-Z0-9]+)\.mp4/)?.[1] || `video_${i}`;
        
        videoList.push({
            id,
            title,
            url,
            thumbnail: `https://picsum.photos/seed/${id}/640/360.jpg`,
            poster: `https://picsum.photos/seed/${id}/1280/720.jpg`,
            duration: Math.floor(Math.random() * 3600) + 60,
            views: utils.getRandomViews(),
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        });
    }
    
    return videoList;
}

// ========== Video Card Component ==========
function createVideoCard(video, index) {
    const card = document.createElement('div');
    card.className = 'video-card group relative bg-dark-800 rounded-xl overflow-hidden border border-white/5 cursor-pointer animate-fade-in-up';
    card.style.animationDelay = `${index * utils.animationDelay}ms`;
    card.style.opacity = '0';
    
    card.innerHTML = `
        <!-- Thumbnail Container -->
        <div class="relative overflow-hidden">
            <img 
                src="${video.thumbnail}" 
                alt="${video.title}"
                class="video-thumbnail w-full bg-dark-700"
                loading="lazy"
                onerror="this.src='https://via.placeholder.com/640x360/1a1a1a/3b82f6?text=Video'"
            >
            
            <!-- Gradient Overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent opacity-60"></div>
            
            <!-- Duration Badge -->
            <div class="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium">
                ${utils.formatDuration(video.duration)}
            </div>
            
            <!-- HD Badge -->
            <div class="absolute top-2 left-2 bg-gradient-to-r from-primary to-secondary px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                HD
            </div>
            
            <!-- Play Button Overlay -->
            <div class="video-overlay absolute inset-0 bg-dark-900/40 flex items-center justify-center opacity-0 transition-opacity">
                <div class="play-button w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 scale-50 opacity-0 transition-all">
                    <i class="fas fa-play text-white text-xl ml-1"></i>
                </div>
            </div>
        </div>
        
        <!-- Content -->
        <div class="p-3">
            <h3 class="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors" title="${video.title}">
                ${video.title}
            </h3>
            <div class="flex items-center justify-between text-xs text-gray-500">
                <div class="flex items-center gap-1">
                    <i class="fas fa-eye text-[10px]"></i>
                    <span>${utils.formatNumber(video.views)} views</span>
                </div>
                <div class="flex items-center gap-1">
                    <i class="fas fa-clock text-[10px]"></i>
                    <span>${utils.formatDuration(video.duration)}</span>
                </div>
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => openPlayer(video));
    
    return card;
}

// ========== Video Player ==========
function openPlayer(video) {
    elements.playerTitle.textContent = video.title;
    elements.videoPlayer.src = video.url;
    elements.videoPlayer.poster = video.poster;
    elements.downloadBtn.href = video.url;
    elements.downloadBtn.download = `${utils.slugify(video.title)}.mp4`;
    
    elements.playerModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Reset buttons
    elements.likeBtn.classList.remove('text-red-500', 'bg-red-500/20');
    elements.bookmarkBtn.classList.remove('text-accent', 'bg-accent/20');
    
    toast.info(`Memutar: ${video.title}`);
}

function closePlayerModal() {
    elements.playerModal.classList.add('hidden');
    elements.videoPlayer.pause();
    elements.videoPlayer.src = '';
    document.body.style.overflow = '';
}

// ========== Render Functions ==========
function renderVideos() {
    elements.videoGrid.innerHTML = '';
    
    const start = (state.currentPage - 1) * CONFIG.videosPerPage;
    const end = start + CONFIG.videosPerPage;
    const videosToShow = state.filteredVideos.slice(start, end);
    
    if (videosToShow.length === 0) {
        elements.videoGrid.innerHTML = `
            <div class="col-span-full text-center py-20">
                <div class="w-20 h-20 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-video-slash text-3xl text-gray-600"></i>
                </div>
                <p class="text-gray-500 mb-2">Tidak ada video ditemukan</p>
                <p class="text-sm text-gray-600">Coba kata kunci lain atau reset filter</p>
            </div>
        `;
        elements.paginationContainer.classList.add('hidden');
        return;
    }
    
    videosToShow.forEach((video, index) => {
        const card = createVideoCard(video, index);
        elements.videoGrid.appendChild(card);
    });
    
    renderPagination();
    
    // Show pagination
    if (state.filteredVideos.length > CONFIG.videosPerPage) {
        elements.paginationContainer.classList.remove('hidden');
    } else {
        elements.paginationContainer.classList.add('hidden');
    }
}

function renderPagination() {
    const totalPages = Math.ceil(state.filteredVideos.length / CONFIG.videosPerPage);
    
    if (totalPages <= 1) {
        elements.paginationContainer.classList.add('hidden');
        return;
    }
    
    elements.pagination.innerHTML = '';
    
    // Previous button
    if (state.currentPage > 1) {
        const prevBtn = createPaginationButton('prev', '<i class="fas fa-chevron-left"></i>');
        elements.pagination.appendChild(prevBtn);
    }
    
    // Page numbers
    const maxVisible = 5;
    let startPage = Math.max(1, state.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    if (startPage > 1) {
        elements.pagination.appendChild(createPaginationButton(1, '1'));
        if (startPage > 2) {
            const dots = document.createElement('span');
            dots.className = 'px-2 text-gray-600';
            dots.textContent = '...';
            elements.pagination.appendChild(dots);
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const btn = createPaginationButton(i, i.toString(), i === state.currentPage);
        elements.pagination.appendChild(btn);
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const dots = document.createElement('span');
            dots.className = 'px-2 text-gray-600';
            dots.textContent = '...';
            elements.pagination.appendChild(dots);
        }
        elements.pagination.appendChild(createPaginationButton(totalPages, totalPages.toString()));
    }
    
    // Next button
    if (state.currentPage < totalPages) {
        const nextBtn = createPaginationButton('next', '<i class="fas fa-chevron-right"></i>');
        elements.pagination.appendChild(nextBtn);
    }
}

function createPaginationButton(page, label, isActive = false) {
    const btn = document.createElement('button');
    btn.className = `w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
        isActive 
            ? 'bg-gradient-to-br from-primary to-secondary text-white' 
            : 'bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-white'
    }`;
    btn.innerHTML = label;
    
    btn.addEventListener('click', () => {
        if (page === 'prev') {
            state.currentPage = Math.max(1, state.currentPage - 1);
        } else if (page === 'next') {
            state.currentPage = Math.min(Math.ceil(state.filteredVideos.length / CONFIG.videosPerPage), state.currentPage + 1);
        } else {
            state.currentPage = page;
        }
        
        renderVideos();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    return btn;
}

// ========== Search & Filter ==========
const searchVideos = utils.debounce((query) => {
    state.searchQuery = query.toLowerCase().trim();
    state.currentPage = 1;
    
    if (!state.searchQuery) {
        state.filteredVideos = [...state.videos];
    } else {
        state.filteredVideos = state.videos.filter(v => 
            v.title.toLowerCase().includes(state.searchQuery)
        );
    }
    
    sortVideos();
    renderVideos();
    
    if (state.searchQuery && state.filteredVideos.length > 0) {
        toast.success(`Ditemukan ${state.filteredVideos.length} video`);
    }
}, CONFIG.debounceTime);

function sortVideos() {
    switch (state.sortBy) {
        case 'newest':
            state.filteredVideos.sort((a, b) => b.createdAt - a.createdAt);
            break;
        case 'oldest':
            state.filteredVideos.sort((a, b) => a.createdAt - b.createdAt);
            break;
        case 'title':
            state.filteredVideos.sort((a, b) => a.title.localeCompare(b.title));
            break;
    }
}

// ========== Initialize App ==========
async function init() {
    utils.showLoading();
    
    // Show loading state
    elements.videoGrid.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-20">
            <div class="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center animate-pulse">
                <i class="fas fa-spinner fa-spin text-2xl text-white"></i>
            </div>
            <p class="mt-4 text-gray-500">Memuat video premium...</p>
        </div>
    `;
    
    try {
        const config = await fetchConfig();
        
        if (!config) {
            throw new Error('Gagal memuat konfigurasi');
        }
        
        state.videos = parseVideos(config);
        state.filteredVideos = [...state.videos];
        
        // Update UI
        elements.totalVideosCount.textContent = `${utils.formatNumber(state.videos.length)} Video Tersedia`;
        
        sortVideos();
        renderVideos();
        
        toast.success(`Berhasil memuat ${state.videos.length} video`);
        
    } catch (error) {
        console.error('Init error:', error);
        elements.videoGrid.innerHTML = `
            <div class="col-span-full text-center py-20">
                <div class="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-exclamation-triangle text-3xl text-red-500"></i>
                </div>
                <p class="text-red-400 mb-2">Gagal memuat video</p>
                <p class="text-sm text-gray-600 mb-4">${error.message}</p>
                <button onclick="init()" class="btn-primary px-6 py-2 rounded-full text-sm">
                    <i class="fas fa-redo mr-2"></i>Coba Lagi
                </button>
            </div>
        `;
        toast.error(error.message);
    }
    
    utils.hideLoading();
}

// ========== Event Listeners ==========
function setupEventListeners() {
    // Search
    elements.searchInput.addEventListener('input', (e) => {
        elements.searchInputMobile.value = e.target.value;
        searchVideos(e.target.value);
    });
    
    elements.searchInputMobile.addEventListener('input', (e) => {
        elements.searchInput.value = e.target.value;
        searchVideos(e.target.value);
    });
    
    // Sort
    elements.sortSelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        sortVideos();
        renderVideos();
        toast.info(`Diurutkan: ${e.target.options[e.target.selectedIndex].text}`);
    });
    
    // Player Modal
    elements.closePlayer.addEventListener('click', closePlayerModal);
    elements.modalBackdrop.addEventListener('click', closePlayerModal);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !elements.playerModal.classList.contains('hidden')) {
            closePlayerModal();
        }
        
        // Focus search with /
        if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
            e.preventDefault();
            elements.searchInput.focus();
        }
    });
    
    // Video player events
    elements.videoPlayer.addEventListener('loadstart', () => {
        elements.playerLoading.classList.remove('hidden');
    });
    
    elements.videoPlayer.addEventListener('canplay', () => {
        elements.playerLoading.classList.add('hidden');
    });
    
    elements.videoPlayer.addEventListener('error', () => {
        toast.error('Gagal memuat video');
        elements.playerLoading.classList.add('hidden');
    });
    
    // Like button
    elements.likeBtn.addEventListener('click', () => {
        elements.likeBtn.classList.toggle('text-red-500');
        elements.likeBtn.classList.toggle('bg-red-500/20');
        toast.success(elements.likeBtn.classList.contains('text-red-500') ? 'Disukai!' : 'Batal menyukai');
    });
    
    // Bookmark button
    elements.bookmarkBtn.addEventListener('click', () => {
        elements.bookmarkBtn.classList.toggle('text-accent');
        elements.bookmarkBtn.classList.toggle('bg-accent/20');
        toast.success(elements.bookmarkBtn.classList.contains('text-accent') ? 'Disimpan ke watchlist!' : 'Dihapus dari watchlist');
    });
    
    // Share button
    elements.shareBtn.addEventListener('click', async () => {
        const url = elements.videoPlayer.src;
        try {
            await navigator.clipboard.writeText(url);
            toast.success('Link video disalin!');
        } catch {
            toast.error('Gagal menyalin link');
        }
    });
    
    // Category buttons
    elements.categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.categoryBtns.forEach(b => {
                b.classList.remove('active', 'bg-primary/20', 'text-primary');
                b.classList.add('bg-dark-700', 'text-gray-400');
            });
            btn.classList.add('active', 'bg-primary/20', 'text-primary');
            btn.classList.remove('bg-dark-700', 'text-gray-400');
            toast.info(`Filter: ${btn.textContent}`);
        });
    });
    
    // View mode
    elements.gridView.addEventListener('click', () => {
        elements.gridView.classList.add('active', 'bg-dark-600', 'text-primary');
        elements.gridView.classList.remove('text-gray-500');
        elements.listView.classList.remove('active', 'bg-dark-600', 'text-primary');
        elements.listView.classList.add('text-gray-500');
    });
    
    elements.listView.addEventListener('click', () => {
        elements.listView.classList.add('active', 'bg-dark-600', 'text-primary');
        elements.listView.classList.remove('text-gray-500');
        elements.gridView.classList.remove('active', 'bg-dark-600', 'text-primary');
        elements.gridView.classList.add('text-gray-500');
    });
}

// ========== Start Application ==========
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    init();
});
