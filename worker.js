/**
 * BlueStreamX - Premium Video Streaming
 * Cloudflare Workers Handler
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS Headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };
    
    // Handle OPTIONS request
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // API Endpoint: Get Videos
    if (url.pathname === '/api/videos') {
      try {
        const response = await fetch('https://cdn2.vid3y.vip/');
        const html = await response.text();
        
        // Extract APP_CONFIG from HTML
        const match = html.match(/window\.APP_CONFIG = (\{.*?\});/s);
        if (match) {
          const config = JSON.parse(match[1]);
          const videos = [];
          const urls = config.videoContent?.urls || [];
          const titles = config.videoContent?.titles || [];
          
          for (let i = 0; i < urls.length; i++) {
            const videoUrl = urls[i];
            const title = titles[i % titles.length] || `Video Premium ${i + 1}`;
            const id = videoUrl.match(/\/([a-zA-Z0-9]+)\.mp4/)?.[1] || `video_${i}`;
            
            videos.push({
              id,
              title,
              url: videoUrl,
              thumbnail: `https://picsum.photos/seed/${id}/640/360.jpg`,
              poster: `https://picsum.photos/seed/${id}/1280/720.jpg`,
              duration: Math.floor(Math.random() * 3600) + 60,
              views: Math.floor(Math.random() * 500000) + 1000
            });
          }
          
          return new Response(JSON.stringify({
            success: true,
            total: videos.length,
            videos
          }), { headers: corsHeaders });
        }
        
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Config not found' 
        }), { 
          status: 500, 
          headers: corsHeaders 
        });
        
      } catch (error) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: error.message 
        }), { 
          status: 500, 
          headers: corsHeaders 
        });
      }
    }
    
    // Serve HTML Page
    const htmlPage = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BlueStreamX | Premium Video Streaming</title>
    <meta name="description" content="Platform streaming video premium dengan koleksi terlengkap">
    <meta name="theme-color" content="#0f0f0f">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#3b82f6',
                        secondary: '#8b5cf6',
                        accent: '#f59e0b',
                        dark: {
                            900: '#0a0a0a',
                            800: '#0f0f0f',
                            700: '#1a1a1a',
                            600: '#242424',
                            500: '#2a2a2a'
                        }
                    },
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                        display: ['Playfair Display', 'serif']
                    }
                }
            }
        }
    </script>
    <style>
        ::-webkit-scrollbar{width:8px;height:8px}::-webkit-scrollbar-track{background:#0a0a0a}::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#3b82f6,#8b5cf6);border-radius:4px}::-webkit-scrollbar-thumb:hover{background:linear-gradient(180deg,#2563eb,#7c3aed)}
        ::selection{background:rgba(59,130,246,0.3);color:white}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes pulse-glow{0%,100%{box-shadow:0 0 20px rgba(59,130,246,0.3)}50%{box-shadow:0 0 40px rgba(59,130,246,0.6)}}
        .animate-fade-in-up{animation:fadeInUp 0.6s ease-out forwards}
        .gradient-text{background:linear-gradient(135deg,#3b82f6,#8b5cf6,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .glass{background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08)}
        .video-card{transition:all 0.4s cubic-bezier(0.175,0.885,0.32,1.275)}
        .video-card:hover{transform:translateY(-8px) scale(1.02);box-shadow:0 25px 50px -12px rgba(59,130,246,0.25)}
        .video-card:hover .video-overlay{opacity:1}
        .video-card:hover .play-button{transform:translate(-50%,-50%) scale(1);opacity:1}
        .video-card:hover .video-thumbnail{transform:scale(1.1)}
        .btn-primary{background:linear-gradient(135deg,#3b82f6,#8b5cf6);transition:all 0.3s ease;position:relative;overflow:hidden}
        .btn-primary:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(59,130,246,0.4)}
        .input-search:focus{box-shadow:0 0 0 3px rgba(59,130,246,0.3)}
        .bg-pattern{background-image:radial-gradient(circle at 20% 50%,rgba(59,130,246,0.1) 0%,transparent 50%),radial-gradient(circle at 80% 80%,rgba(139,92,246,0.1) 0%,transparent 50%),radial-gradient(circle at 40% 20%,rgba(236,72,153,0.05) 0%,transparent 50%)}
        .video-thumbnail{aspect-ratio:16/9;object-fit:cover;transition:transform 0.5s ease}
        .modal-backdrop{background:rgba(0,0,0,0.9);backdrop-filter:blur(10px)}
        .line-clamp-2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
    </style>
</head>
<body class="bg-dark-900 text-white min-h-screen font-sans antialiased">
    <div class="fixed inset-0 bg-pattern pointer-events-none"></div>
    
    <header class="sticky top-0 z-50 glass border-b border-white/5">
        <div class="container mx-auto px-4 lg:px-8">
            <div class="flex items-center justify-between h-16 lg:h-20">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <i class="fas fa-play text-white text-lg lg:text-xl"></i>
                    </div>
                    <div>
                        <h1 class="font-display text-xl lg:text-2xl font-bold gradient-text">BlueStreamX</h1>
                        <p class="text-[10px] lg:text-xs text-gray-500">Premium Streaming</p>
                    </div>
                </div>
                <div class="hidden md:flex flex-1 max-w-xl mx-8">
                    <div class="relative w-full">
                        <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
                        <input type="text" id="searchInput" placeholder="Cari video favorit Anda..." class="input-search w-full bg-dark-700 border border-white/10 rounded-full py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all">
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <button class="btn-primary px-6 py-2.5 rounded-full text-sm font-semibold">
                        <i class="fas fa-crown mr-2"></i>Premium
                    </button>
                </div>
            </div>
        </div>
    </header>
    
    <section class="relative py-12 lg:py-16 overflow-hidden">
        <div class="container mx-auto px-4 lg:px-8">
            <div class="text-center max-w-3xl mx-auto animate-fade-in-up">
                <h2 class="font-display text-4xl lg:text-5xl font-bold mb-4">Streaming Video <span class="gradient-text">Premium</span></h2>
                <p class="text-gray-400 mb-6">Nikmati ribuan video berkualitas tinggi dengan streaming tanpa batas</p>
                <div class="flex flex-wrap items-center justify-center gap-4">
                    <div class="flex items-center gap-2 text-sm text-gray-500"><i class="fas fa-film text-primary"></i><span id="totalVideos">Loading...</span></div>
                    <div class="w-px h-4 bg-gray-700"></div>
                    <div class="flex items-center gap-2 text-sm text-gray-500"><i class="fas fa-hd text-secondary"></i><span>HD Quality</span></div>
                    <div class="w-px h-4 bg-gray-700"></div>
                    <div class="flex items-center gap-2 text-sm text-gray-500"><i class="fas fa-bolt text-accent"></i><span>Fast Streaming</span></div>
                </div>
            </div>
        </div>
    </section>
    
    <main class="py-8 lg:py-12">
        <div class="container mx-auto px-4 lg:px-8">
            <div id="videoGrid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6">
                <div class="col-span-full flex flex-col items-center justify-center py-20">
                    <div class="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center animate-pulse">
                        <i class="fas fa-spinner fa-spin text-2xl text-white"></i>
                    </div>
                    <p class="mt-4 text-gray-500">Memuat video...</p>
                </div>
            </div>
            <div id="paginationContainer" class="hidden mt-12">
                <div class="flex items-center justify-center gap-2" id="pagination"></div>
            </div>
        </div>
    </main>
    
    <div id="playerModal" class="fixed inset-0 z-50 hidden">
        <div class="modal-backdrop absolute inset-0" id="modalBackdrop"></div>
        <div class="relative flex items-center justify-center min-h-screen p-4">
            <div class="glass w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up">
                <div class="flex items-center justify-between p-4 border-b border-white/10">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <i class="fas fa-play text-white"></i>
                        </div>
                        <h3 id="playerTitle" class="font-semibold text-lg truncate max-w-md">Video Title</h3>
                    </div>
                    <button id="closePlayer" class="w-10 h-10 rounded-full bg-dark-700 hover:bg-red-500/20 hover:text-red-500 flex items-center justify-center transition-all">
                        <i class="fas fa-times text-lg"></i>
                    </button>
                </div>
                <div class="relative bg-black aspect-video">
                    <video id="videoPlayer" controls class="w-full h-full" autoplay></video>
                </div>
                <div class="p-4 flex flex-wrap items-center justify-between gap-4 border-t border-white/10">
                    <div class="flex items-center gap-2">
                        <button id="likeBtn" class="w-10 h-10 rounded-full bg-dark-700 hover:bg-primary/20 hover:text-primary flex items-center justify-center transition-all"><i class="fas fa-heart"></i></button>
                        <button id="shareBtn" class="w-10 h-10 rounded-full bg-dark-700 hover:bg-secondary/20 hover:text-secondary flex items-center justify-center transition-all"><i class="fas fa-share-alt"></i></button>
                    </div>
                    <a id="downloadBtn" href="#" download class="btn-primary px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2"><i class="fas fa-download"></i><span>Download</span></a>
                </div>
            </div>
        </div>
    </div>
    
    <div id="toastContainer" class="fixed bottom-6 right-6 z-50 flex flex-col gap-3"></div>
    
    <script>
        const CONFIG={cdnUrl:'/api/videos',videosPerPage:24};
        let videos=[],filteredVideos=[],currentPage=1;
        const $=id=>document.getElementById(id);
        const formatDuration=s=>{const m=Math.floor(s/60),sec=s%60;return m+':'+String(sec).padStart(2,'0')};
        const formatNumber=n=>n>=1000000?(n/1000000).toFixed(1)+'M':n>=1000?(n/1000).toFixed(1)+'K':n.toString();
        const toast=(msg,type='info')=>{
            const colors={success:'from-green-500 to-emerald-600',error:'from-red-500 to-rose-600',info:'from-blue-500 to-indigo-600'};
            const icons={success:'fa-check-circle',error:'fa-times-circle',info:'fa-info-circle'};
            const t=document.createElement('div');
            t.className='toast flex items-center gap-3 px-5 py-3 rounded-xl glass border border-white/10 shadow-lg';
            t.innerHTML='<div class="w-8 h-8 rounded-full bg-gradient-to-br '+colors[type]+' flex items-center justify-center"><i class="fas '+icons[type]+' text-white text-sm"></i></div><p class="text-sm">'+msg+'</p>';
            $('toastContainer').appendChild(t);
            setTimeout(()=>{t.style.opacity='0';t.style.transform='translateX(100%)';t.style.transition='all 0.3s ease';setTimeout(()=>t.remove(),300)},3000);
        };
        
        function createCard(v,i){
            const c=document.createElement('div');
            c.className='video-card group relative bg-dark-800 rounded-xl overflow-hidden border border-white/5 cursor-pointer animate-fade-in-up';
            c.style.animationDelay=(i*50)+'ms';
            c.style.opacity='0';
            c.innerHTML='<div class="relative overflow-hidden"><img src="'+v.thumbnail+'" alt="'+v.title+'" class="video-thumbnail w-full bg-dark-700" loading="lazy"><div class="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent opacity-60"></div><div class="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium">'+formatDuration(v.duration)+'</div><div class="absolute top-2 left-2 bg-gradient-to-r from-primary to-secondary px-2 py-0.5 rounded text-[10px] font-bold uppercase">HD</div><div class="video-overlay absolute inset-0 bg-dark-900/40 flex items-center justify-center opacity-0 transition-opacity"><div class="play-button w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 scale-50 opacity-0 transition-all"><i class="fas fa-play text-white text-xl ml-1"></i></div></div></div><div class="p-3"><h3 class="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">'+v.title+'</h3><div class="flex items-center justify-between text-xs text-gray-500"><div class="flex items-center gap-1"><i class="fas fa-eye text-[10px]"></i><span>'+formatNumber(v.views)+' views</span></div></div></div>';
            c.onclick=()=>openPlayer(v);
            return c;
        }
        
        function openPlayer(v){
            $('playerTitle').textContent=v.title;
            $('videoPlayer').src=v.url;
            $('downloadBtn').href=v.url;
            $('downloadBtn').download=v.title.replace(/\\s+/g,'-')+'.mp4';
            $('playerModal').classList.remove('hidden');
            document.body.style.overflow='hidden';
            toast('Memutar: '+v.title);
        }
        
        function closePlayer(){
            $('playerModal').classList.add('hidden');
            $('videoPlayer').pause();
            document.body.style.overflow='';
        }
        
        function renderVideos(){
            const grid=$('videoGrid');
            grid.innerHTML='';
            const start=(currentPage-1)*CONFIG.videosPerPage;
            const vids=filteredVideos.slice(start,start+CONFIG.videosPerPage);
            if(!vids.length){grid.innerHTML='<div class="col-span-full text-center py-20"><p class="text-gray-500">Tidak ada video ditemukan</p></div>';return}
            vids.forEach((v,i)=>grid.appendChild(createCard(v,i)));
            renderPagination();
        }
        
        function renderPagination(){
            const pages=Math.ceil(filteredVideos.length/CONFIG.videosPerPage);
            const p=$('pagination');
            p.innerHTML='';
            if(pages<=1){$('paginationContainer').classList.add('hidden');return}
            $('paginationContainer').classList.remove('hidden');
            for(let i=1;i<=Math.min(pages,10);i++){
                const b=document.createElement('button');
                b.className='w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all '+(i===currentPage?'bg-gradient-to-br from-primary to-secondary text-white':'bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-white');
                b.textContent=i;
                b.onclick=()=>{currentPage=i;renderVideos();window.scrollTo({top:0,behavior:'smooth'})};
                p.appendChild(b);
            }
        }
        
        async function init(){
            try{
                const res=await fetch(CONFIG.cdnUrl);
                const data=await res.json();
                videos=data.videos;
                filteredVideos=[...videos];
                $('totalVideos').textContent=formatNumber(videos.length)+' Video Tersedia';
                renderVideos();
                toast.success('Berhasil memuat '+videos.length+' video');
            }catch(e){
                $('videoGrid').innerHTML='<div class="col-span-full text-center py-20"><p class="text-red-400">Gagal memuat video</p></div>';
                toast.error('Gagal memuat video');
            }
        }
        
        $('searchInput').addEventListener('input',e=>{
            const q=e.target.value.toLowerCase().trim();
            filteredVideos=q?videos.filter(v=>v.title.toLowerCase().includes(q)):[...videos];
            currentPage=1;
            renderVideos();
        });
        
        $('closePlayer').onclick=closePlayer;
        $('modalBackdrop').onclick=closePlayer;
        $('shareBtn').onclick=()=>{navigator.clipboard.writeText($('videoPlayer').src);toast.success('Link disalin!')};
        $('likeBtn').onclick=()=>{$('likeBtn').classList.toggle('text-red-500');$('likeBtn').classList.toggle('bg-red-500/20');toast.success($('likeBtn').classList.contains('text-red-500')?'Disukai!':'Batal menyukai')};
        document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('playerModal').classList.contains('hidden'))closePlayer()});
        
        init();
    </script>
</body>
</html>`;
    
    return new Response(htmlPage, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
};
