import React from 'react';

async function main() {
  const api = (window as any).Spicetify;
  while (!api?.Player?.data || !api?.Playbar) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes fadeInSlide {
      from { opacity: 0; transform: translateY(10px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    #genius-x-window {
      position: fixed;
      top: 70px;
      right: 25px;
      width: 400px;
      max-height: calc(100vh - 150px);
      /* Глубокий матовый фон */
      background: rgba(18, 18, 18, 0.9);
      backdrop-filter: blur(30px);
      -webkit-backdrop-filter: blur(30px);
      
      /* Очень тонкая, едва заметная граница */
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 24px;
      
      color: #FFFFFF;
      z-index: 9999;
      display: none;
      flex-direction: column;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
      font-family: 'Circular Sp', sans-serif;
      animation: fadeInSlide 0.3s cubic-bezier(0.2, 0, 0.2, 1);
      overflow: hidden;
    }

    .gx-header {
      padding: 24px 24px 16px 24px;
      background: linear-gradient(to bottom, rgba(255,255,255,0.03), transparent);
    }

    .gx-title { 
      font-size: 20px; 
      font-weight: 700; 
      color: #fff; 
      letter-spacing: -0.5px;
      margin-bottom: 4px;
    }

    .gx-artist { 
      font-size: 14px; 
      color: rgba(255, 255, 255, 0.6); 
      font-weight: 400; 
    }

    .gx-body {
      padding: 0 24px 24px 24px;
      overflow-y: auto;
      font-size: 17px;
      line-height: 1.8;
      color: rgba(255, 255, 255, 0.85);
      white-space: pre-wrap;
    }

    /* Стильный минималистичный скроллбар */
    .gx-body::-webkit-scrollbar { width: 4px; }
    .gx-body::-webkit-scrollbar-track { background: transparent; }
    .gx-body::-webkit-scrollbar-thumb { 
      background: rgba(255, 255, 255, 0.1); 
      border-radius: 10px; 
    }
    .gx-body::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }

    /* Активное состояние кнопки в баре */
    .gx-btn-active { color: #1DB954 !important; }
  `;
  document.head.appendChild(style);

  const win = document.createElement("div");
  win.id = "genius-x-window";
  win.innerHTML = `
    <div class="gx-header">
      <div class="gx-title" id="gx-t"></div>
      <div class="gx-artist" id="gx-a"></div>
    </div>
    <div class="gx-body" id="gx-b"></div>
  `;
  document.body.appendChild(win);

  async function update() {
    const item = api.Player.data?.item;
    if (!item) return;

    const t = item.metadata.title.replace(/\(feat\..*?\)|\[.*?\]/g, "").trim();
    const a = item.metadata.artist_name.split(',')[0].trim();

    (document.getElementById("gx-t") as HTMLElement).innerText = item.metadata.title;
    (document.getElementById("gx-a") as HTMLElement).innerText = item.metadata.artist_name;
    const body = document.getElementById("gx-b") as HTMLElement;
    
    body.style.opacity = "0.5";
    
    try {
      const res = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(a + " " + t)}`);
      const data = await res.json();
      const found = data.find((r: any) => r.plainLyrics) || data[0];
      body.style.opacity = "1";
      body.innerText = found?.plainLyrics || "Текст пока не добавлен в базу.";
    } catch (e) {
      body.innerText = "Не удалось загрузить текст.";
    }
  }

  const icon = `<svg height="18" width="18" viewBox="0 0 16 16" fill="currentColor"><path d="M10 2a3 3 0 10-4 0v5a3 3 0 104 0V2z"/><path d="M13 7a.5.5 0 00-1 0 4 4 0 11-8 0 .5.5 0 00-1 0 5 5 0 0010 0z"/><path d="M8 12a.5.5 0 00-.5.5v2a.5.5 0 001 0v-2A.5.5 0 008 12z"/></svg>`;
  
  const button = new api.Playbar.Button("Lyrics", icon, () => {
    if (win.style.display === "none" || win.style.display === "") {
      win.style.display = "flex";
      button.element.classList.add("gx-btn-active");
      update();
    } else {
      win.style.display = "none";
      button.element.classList.remove("gx-btn-active");
    }
  });

  api.Player.addEventListener("songchange", () => {
    if (win.style.display === "flex") update();
  });
}

export default main;