export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // API Endpoint
    if (url.pathname === '/api/videos') {
      try {
        const response = await fetch('https://cdn2.vid3y.vip/');
        const html = await response.text();
        const match = html.match(/window\.APP_CONFIG = (\{.*?\});/s);
        
        if (match) {
          const config = JSON.parse(match[1]);
          const urls = config.videoContent?.urls || [];
          const titles = config.videoContent?.titles || [];
          const videos = urls.slice(0, 500).map((u, i) => ({
            id: u.match(/\/([a-zA-Z0-9]+)\.mp4/)?.[1] || `v${i}`,
            title: titles[i % titles.length] || `Video ${i+1}`,
            url: u,
            thumbnail: `https://picsum.photos/seed/${i}/640/360.jpg`,
            duration: Math.floor(Math.random() * 3600) + 60,
            views: Math.floor(Math.random() * 500000) + 1000
          }));
          
          return new Response(JSON.stringify({ success: true, total: videos.length, videos }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }
        return new Response(JSON.stringify({ success: false, error: 'No config' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ success: false, error: e.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // HTML Page
    return new Response(`<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BlueStreamX | Premium Streaming</title>
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
<script>
tailwind.config={theme:{extend:{colors:{primary:'#3b82f6',secondary:'#8b5cf6',accent:'#f59e0b',dark:{900:'#0a0a0a',800:'#0f0f0f',700:'#1a1a1a',600:'#242424'}},fontFamily:{sans:['Inter','sans-serif'],display:['Playfair Display','serif']}}}}
</script>
<style>
::-webkit-scrollbar{width:8px}::-webkit-scrollbar-track{background:#0a0a0a}::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#3b82f6,#8b5cf6);border-radius:4px}
@keyframes fadeInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.animate-fade-in-up{animation:fadeInUp .5s ease-out forwards}
.gradient-text{background:linear-gradient(135deg,#3b82f6,#8b5cf6,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.glass{background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08)}
.video-card{transition:all .3s ease}.video-card:hover{transform:translateY(-5px);box-shadow:0 20px 40px rgba(59,130,246,0.2)}
.btn-primary{background:linear-gradient(135deg,#3b82f6,#8b5cf6);transition:all .3s}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(59,130,246,0.4)}
.line-clamp-2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
</style>
</head>
<body class="bg-dark-900 text-white min-h-screen font-sans">
<div class="fixed inset-0 pointer-events-none" style="background:radial-gradient(circle at 20% 50%,rgba(59,130,246,0.1) 0%,transparent 50%),radial-gradient(circle at 80% 80%,rgba(139,92,246,0.1) 0%,transparent 50%)"></div>

<header class="sticky top-0 z-50 glass border-b border-white/5">
<div class="container mx-auto px-4 h-16 flex items-center justify-between">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
<i class="fas fa-play text-white"></i>
</div>
<h1 class="font-display text-xl font-bold gradient-text">BlueStreamX</h1>
</div>
<div class="flex-1 max-w-md mx-8 hidden md:block">
<input type="text" id="search" placeholder="Cari video..." class="w-full bg-dark-700 border border-white/10 rounded-full py-2 px-4 text-sm focus:outline-none focus:border-primary">
</div>
<button class="btn-primary px-5 py-2 rounded-full text-sm font-semibold"><i class="fas fa-crown mr-2"></i>Premium</button>
</div>
</header>

<section class="py-12 text-center">
<h2 class="font-display text-4xl lg:text-5xl font-bold mb-4">Streaming Video <span class="gradient-text">Premium</span></h2>
<p class="text-gray-400 mb-6">Ribuan video berkualitas HD siap ditonton</p>
<div class="flex items-center justify-center gap-4 text-sm text-gray-500">
<span><i class="fas fa-film text-primary mr-2"></i><span id="total">Loading...</span></span>
<span><i class="fas fa-hd text-secondary mr-2"></i>HD Quality</span>
<span><i class="fas fa-bolt text-accent mr-2"></i>Fast</span>
</div>
</section>

<main class="container mx-auto px-4 py-8">
<div id="grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
<div class="col-span-full text-center py-20"><i class="fas fa-spinner fa-spin text-4xl text-primary"></i><p class="mt-4 text-gray-500">Memuat video...</p></div>
</div>
<div id="pagination" class="flex justify-center gap-2 mt-8"></div>
</main>

<div id="modal" class="fixed inset-0 z-50 hidden items-center justify-center p-4" style="background:rgba(0,0,0,0.9)">
<div class="glass w-full max-w-4xl rounded-2xl overflow-hidden">
<div class="p-4 border-b border-white/10 flex items-center justify-between">
<h3 id="title" class="font-semibold truncate">Video</h3>
<button onclick="closeModal()" class="w-10 h-10 rounded-full bg-dark-700 hover:bg-red-500/20 flex items-center justify-center"><i class="fas fa-times"></i></button>
</div>
<video id="player" controls class="w-full aspect-video bg-black" autoplay></video>
<div class="p-4 flex justify-between">
<div class="flex gap-2">
<button onclick="like()" id="likeBtn" class="w-10 h-10 rounded-full bg-dark-700 hover:bg-primary/20 flex items-center justify-center"><i class="fas fa-heart"></i></button>
<button onclick="share()" class="w-10 h-10 rounded-full bg-dark-700 hover:bg-secondary/20 flex items-center justify-center"><i class="fas fa-share"></i></button>
</div>
<a id="download" href="#" download class="btn-primary px-6 py-2 rounded-full text-sm font-semibold"><i class="fas fa-download mr-2"></i>Download</a>
</div>
</div>
</div>

<div id="toast" class="fixed bottom-6 right-6 z-50"></div>

<script>
let videos=[],filtered=[],page=1;
const $=id=>document.getElementById(id);
const fmt=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
const num=n=>n>=1000000?(n/1000000).toFixed(1)+'M':n>=1000?(n/1000).toFixed(1)+'K':n+'';
const toast=msg=>$('toast').innerHTML='<div class="flex items-center gap-3 px-4 py-3 rounded-xl glass"><i class="fas fa-check-circle text-green-400"></i><span>'+msg+'</span></div>';

function card(v,i){
const c=document.createElement('div');
c.className='video-card bg-dark-800 rounded-xl overflow-hidden cursor-pointer animate-fade-in-up';
c.style.animationDelay=i*30+'ms';
c.innerHTML='<div class="relative overflow-hidden"><img src="'+v.thumbnail+'" class="w-full aspect-video object-cover"><div class="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs">'+fmt(v.duration)+'</div><div class="absolute top-2 left-2 bg-gradient-to-r from-primary to-secondary px-2 py-0.5 rounded text-[10px] font-bold">HD</div></div><div class="p-3"><h3 class="text-sm font-medium line-clamp-2">'+v.title+'</h3><div class="text-xs text-gray-500 mt-1"><i class="fas fa-eye mr-1"></i>'+num(v.views)+'</div></div>';
c.onclick=()=>play(v);
return c;
}

function play(v){
$('title').textContent=v.title;
$('player').src=v.url;
$('download').href=v.url;
$('download').download=v.title+'.mp4';
$('modal').classList.remove('hidden');
$('modal').classList.add('flex');
document.body.style.overflow='hidden';
toast('Memutar: '+v.title);
}

function closeModal(){
$('modal').classList.add('hidden');
$('player').pause();
document.body.style.overflow='';
}

function render(){
const g=$('grid');g.innerHTML='';
const start=(page-1)*24;
const list=filtered.slice(start,start+24);
if(!list.length){g.innerHTML='<div class="col-span-full text-center py-20 text-gray-500">Tidak ada video</div>';return}
list.forEach((v,i)=>g.appendChild(card(v,i)));
pag();
}

function pag(){
const pages=Math.ceil(filtered.length/24);
const p=$('pagination');p.innerHTML='';
if(pages<=1)return;
for(let i=1;i<=Math.min(pages,10);i++){
const b=document.createElement('button');
b.className='w-10 h-10 rounded-lg '+(i===page?'bg-gradient-to-br from-primary to-secondary':'bg-dark-700 hover:bg-dark-600');
b.textContent=i;
b.onclick=()=>{page=i;render();scroll(0,0)};
p.appendChild(b);
}
}

async function init(){
try{
const r=await fetch('/api/videos');
const d=await r.json();
if(!d.success)throw new Error(d.error);
videos=d.videos;
filtered=videos;
$('total').textContent=num(videos.length)+' Video';
render();
toast('Berhasil memuat '+videos.length+' video');
}catch(e){
$('grid').innerHTML='<div class="col-span-full text-center py-20"><p class="text-red-400">Gagal: '+e.message+'</p><button onclick="init()" class="btn-primary px-6 py-2 rounded-full mt-4">Coba Lagi</button></div>';
}
}

$('search').oninput=e=>{
const q=e.target.value.toLowerCase();
filtered=q?videos.filter(v=>v.title.toLowerCase().includes(q)):videos;
page=1;render();
};

function like(){$('likeBtn').classList.toggle('text-red-500');toast('Disukai!')}
function share(){navigator.clipboard.writeText($('player').src);toast('Link disalin!')}
document.onkeydown=e=>e.key==='Escape'&&closeModal();

init();
</script>
</body>
</html>`, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
};
