/* ─── CANVAS & CONTEXT ─── */
const canvas = document.getElementById('fx-canvas');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

/* ─── RIBBON (DẢI RUY BĂNG) ─── */
const RC = ['#FF89B0', '#C9A6E4', '#FFB89A', '#7BE8F0', '#FFD700', '#98FB98', '#FF7F50', '#B0C4FF', '#FF6EB4', '#A8D8EA'];

class Ribbon {
  constructor(scatter) { this.init(scatter); }
  init(scatter) {
    this.x    = Math.random() * canvas.width;
    this.y    = scatter ? Math.random() * canvas.height : -20;
    this.len  = Math.random() * 22 + 14;   // chiều dài dải
    this.w    = Math.random() * 3 + 1.5;   // độ dày mảnh
    this.c    = RC[Math.floor(Math.random() * RC.length)];
    this.sp   = Math.random() * 2 + 1;     // tốc độ rơi
    this.dx   = (Math.random() - 0.5) * 1.2;
    this.ang  = Math.random() * Math.PI * 2;
    this.dAng = (Math.random() - 0.5) * 0.08; // xoay nhẹ
    this.wave = Math.random() * Math.PI * 2;   // phase uốn
    this.amp  = Math.random() * 18 + 8;        // biên độ uốn
    this.freq = Math.random() * 0.04 + 0.02;   // tần số uốn
  }
  tick() {
    this.y    += this.sp;
    this.x    += this.dx;
    this.ang  += this.dAng;
    this.wave += this.freq * 2;
    if (this.y > canvas.height + 30) this.init(false);
  }
  draw() {
    ctx.save();
    ctx.strokeStyle = this.c;
    ctx.lineWidth   = this.w;
    ctx.lineCap     = 'round';
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    // vẽ đường cong uốn lượn
    for (let t = 0; t <= 1; t += 0.1) {
      const px = this.x + Math.sin(this.wave + t * Math.PI * 2) * this.amp * t;
      const py = this.y - this.len * t;
      t === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();
  }
}
const ribbons = Array.from({ length: 120 }, () => new Ribbon(true));

/* ─── FIREWORKS (PHÁO HOA) ─── */
const FC = ['#FF89B0', '#FFD700', '#C9A6E4', '#00CED1', '#FF7F50', '#98FB98', '#7B68EE', '#FFF176', '#80DEEA', '#FFB7C5'];
const sparks = [];
const fireworks = [];

class Spark {
  constructor(x, y) {
    const spd = Math.random() * 7.5 + 2.5, ang = Math.random() * Math.PI * 2;
    this.x = x; this.y = y;
    this.vx = Math.cos(ang) * spd;
    this.vy = Math.sin(ang) * spd;
    this.life = 1;
    this.decay = Math.random() * 0.012 + 0.008; // tồn tại lâu hơn chút
    this.r = Math.random() * 1.8 + 0.8;  // tia mảnh hơn
    this.c = FC[Math.floor(Math.random() * FC.length)];
    this.star = Math.random() < .3;
    this.trail = [];
  }
  tick() {
    this.trail.push({ x: this.x, y: this.y, l: this.life });
    if (this.trail.length > 4) this.trail.shift();
    this.x += this.vx; this.y += this.vy;
    this.vy += .13; this.vx *= .986;
    this.life -= this.decay;
  }
  draw() {
    this.trail.forEach((t, i) => {
      ctx.save(); ctx.globalAlpha = t.l * .18 * (i / this.trail.length);
      ctx.fillStyle = this.c; ctx.beginPath();
      ctx.arc(t.x, t.y, this.r * t.l * .5, 0, Math.PI * 2);
      ctx.fill(); ctx.restore();
    });
    if (this.star) {
      ctx.save(); ctx.globalAlpha = this.life; ctx.fillStyle = this.c; ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = i * Math.PI / 5 - Math.PI / 2, rad = i % 2 === 0 ? this.r * this.life : this.r * this.life * .42;
        i === 0 ? ctx.moveTo(this.x + Math.cos(a) * rad, this.y + Math.sin(a) * rad) : ctx.lineTo(this.x + Math.cos(a) * rad, this.y + Math.sin(a) * rad);
      }
      ctx.closePath(); ctx.fill(); ctx.restore();
    } else {
      ctx.save(); ctx.globalAlpha = this.life; ctx.fillStyle = this.c; ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * this.life, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  }
}

class Firework {
  constructor(x, targetY) {
    this.x = x;
    this.y = canvas.height; // bắt đầu từ dưới đáy
    this.targetY = targetY;

    this.vy = - (Math.random() * 4 + 6); // bay lên
    this.vx = Math.random() * 2 - 1;

    this.done = false;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // khi đạt độ cao → nổ
    if (this.y <= this.targetY) {
      burst(this.x, this.y);
      this.done = true;
    }
  }

  draw() {
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.vx * 2, this.y - this.vy * 2);
    ctx.strokeStyle = "#fff";
    ctx.stroke();
  }
}

function burst(x, y) { for (let i = 0; i < 120; i++) sparks.push(new Spark(x, y)); }

function autoFw() {
  // Bắn 1 loạt 6–8 quả, trải đều màn hình, không lặp lại
  const count = Math.floor(Math.random() * 3) + 6;
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const x = canvas.width * 0.1 + (canvas.width * 0.8 / count) * i + Math.random() * 40 - 20;
      const y = Math.random() * canvas.height * 0.45 + canvas.height * 0.05;
      fireworks.push(new Firework(x, y));
    }, i * 120); // mỗi quả cách nhau 120ms để không nổ cùng lúc
  }
}

/* ─── ANIMATION LOOP ─── */
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ribbons.forEach(r => { r.tick(); r.draw(); });

  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].update();
    fireworks[i].draw();

    if (fireworks[i].done) {
      fireworks.splice(i, 1);
    }
  }

  for (let i = sparks.length - 1; i >= 0; i--) {
    sparks[i].tick(); sparks[i].draw();
    if (sparks[i].life <= 0) sparks.splice(i, 1);
  }
  requestAnimationFrame(loop);
}
loop();

/* ─── FLOATING SHAPES (CÁC HÌNH BAY) ─── */
const EMOJIS = ['💖', '⭐', '🌸', '💫', '✨', '🎀', '🌙', '🦋', '🌷', '🍭', '💝', '🌺'];
const SVGCOL = ['#FF89B0', '#C9A6E4', '#FFB89A', '#7BE8F0', '#FFD700', '#98FB98', '#B0C4FF', '#FFA0C8'];
const SVGS = ['heart', 'star', 'circle', 'diamond'];

function svgShape(t, c, d) {
  const m = {
    heart: `<svg xmlns="http://www.w3.org/2000/svg" width="${d}" height="${d}" viewBox="0 0 100 100"><path d="M50 82C50 82 8 52 8 28C8 14 20 4 33 7C41 9 47 15 50 20C53 15 59 9 67 7C80 4 92 14 92 28C92 52 50 82 50 82Z" fill="${c}" opacity=".85"/></svg>`,
    star: `<svg xmlns="http://www.w3.org/2000/svg" width="${d}" height="${d}" viewBox="0 0 100 100"><polygon points="50,7 61,35 90,35 67,57 76,86 50,68 24,86 33,57 10,35 39,35" fill="${c}" opacity=".85"/></svg>`,
    circle: `<svg xmlns="http://www.w3.org/2000/svg" width="${d}" height="${d}" viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="${c}" opacity=".75"/></svg>`,
    diamond: `<svg xmlns="http://www.w3.org/2000/svg" width="${d}" height="${d}" viewBox="0 0 100 100"><polygon points="50,5 95,50 50,95 5,50" fill="${c}" opacity=".82"/></svg>`,
  }; return m[t];
}

function spawnShape() {
  const layer = document.getElementById('shape-layer');
  const el = document.createElement('div');
  el.className = 'fshape';
  const size = Math.random() * 28 + 16, dur = Math.random() * 7 + 7;
  el.style.left = (Math.random() * 96) + 'vw';
  el.style.animationDuration = dur + 's';
  if (Math.random() < .5) {
    el.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    el.style.fontSize = size + 'px';
    el.style.filter = 'drop-shadow(0 2px 5px rgba(0,0,0,.1))';
  } else {
    const c = SVGCOL[Math.floor(Math.random() * SVGCOL.length)];
    const s = SVGS[Math.floor(Math.random() * SVGS.length)];
    el.innerHTML = svgShape(s, c, size);
    el.style.filter = 'drop-shadow(0 3px 7px rgba(0,0,0,.12))';
  }
  layer.appendChild(el);
  setTimeout(() => el.remove(), (dur + .5) * 1000);
}

/* ─── TYPING EFFECT (HIỆU ỨNG GÕ CHỮ) ─── */
const MSG = 'Thân gửi Hoài Anh,\n\nTương lai sau này có như thế nào, hãy luôn trở thành người mà em mong muốn, yêu thương bản thân, làm nhiều điều mình muốn và hãy sống thật vui vẻ, hạnh phúc.\n\nChúc mừng sinh nhật tuổi mới rực rỡ, vui tươi nhe. 🎂✨';
const MSG_CHARS = Array.from(MSG);
let tIdx = 0, tDone = false, isTyping = false;

function startTyping() {
  if (tDone || isTyping) return; // Nếu đã gõ xong HOẶC đang gõ thì không chạy nữa
  isTyping = true; 
  
  const el = document.getElementById('msg-text');
  const curChar = document.createElement('span');
  curChar.className = 'cursor'; el.appendChild(curChar);

  function tick() {
    if (tIdx >= MSG_CHARS.length) { 
      tDone = true; 
      isTyping = false; // Đánh dấu đã gõ xong hoàn toàn
      return; 
    }
    const ch = MSG_CHARS[tIdx++];
    if (ch === '\n') el.insertBefore(document.createElement('br'), curChar);
    else el.insertBefore(document.createTextNode(ch), curChar);
    setTimeout(tick, ch === ',' || ch === '.' || ch === '!' ? 125 : 40);
  }
  tick();
}

/* ─── SLIDES NAVIGATION ─── */
const slides = Array.from(document.querySelectorAll('.slide'));
const dots = Array.from(document.querySelectorAll('.dot'));
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
let curIdx = 0, isBusy = false;
const navEl = document.getElementById('nav');

function goTo(to, dir) {
  if (isBusy || to === curIdx || to < 0 || to >= slides.length) return;
  isBusy = true;
  navEl.classList.add('busy');
  const fromSlide = slides[curIdx], destSlide = slides[to];
  destSlide.style.transition = 'none';
  destSlide.style.transform = dir > 0 ? 'translateX(100%)' : 'translateX(-100%)';
  destSlide.style.opacity = '0';
  destSlide.classList.add('active');
  
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const T = 'transform .65s cubic-bezier(.4,0,.2,1), opacity .65s ease';
    destSlide.style.transition = T; destSlide.style.transform = 'translateX(0)'; destSlide.style.opacity = '1';
    fromSlide.style.transition = T; fromSlide.style.transform = dir > 0 ? 'translateX(-100%)' : 'translateX(100%)'; fromSlide.style.opacity = '0';
    setTimeout(() => {
      fromSlide.classList.remove('active');
      [fromSlide, destSlide].forEach(s => { s.style.transition = s.style.transform = s.style.opacity = ''; });
      curIdx = to; isBusy = false; updateNav();
      navEl.classList.remove('busy');
      if (to === 1 && !tDone) startTyping();
      if (to === 2) {
        const items = document.querySelectorAll('.wi');

        items.forEach((el, i) => {
          setTimeout(() => {
            el.style.animation = "popInBounce 0.6s ease forwards";
          }, i * 120); // delay từng cái
        });
      }
      if (to === 3) {
        burst(canvas.width * .2, canvas.height * .3);
        burst(canvas.width * .8, canvas.height * .28);
        burst(canvas.width * .5, canvas.height * .18);
      }
    }, 680);
  }));
}

function updateNav() {
  dots.forEach((d, i) => d.classList.toggle('on', i === curIdx));
  prevBtn.disabled = curIdx === 0; 
  nextBtn.disabled = curIdx === slides.length - 1;
  document.getElementById('hint').textContent = (curIdx + 1) + ' / ' + slides.length;
}

prevBtn.addEventListener('click', () => goTo(curIdx - 1, -1));
nextBtn.addEventListener('click', () => goTo(curIdx + 1, 1));
dots.forEach((d, i) => d.addEventListener('click', () => goTo(i, i > curIdx ? 1 : -1)));

/* ─── PHOTO BOOK ─── */
const photoPages = Array.from(document.querySelectorAll('.book-page'));
const FLIP_MS = 900;   // slightly longer than the CSS transition (.85s)
const AUTO_MS = 2600;  // delay between automatic flips
let photoIndex = 0;    // index of the page currently on top
let photoBusy = false; // blocks new flips while the last page is animating

// Apply a page state instantly, without playing the CSS transition
function setPageInstant(page, flipped, z) {
  page.style.transition = 'none';
  page.classList.toggle('flipped', flipped);
  page.style.zIndex = String(z);
  void page.offsetWidth; // force reflow so the change is applied immediately
  page.style.transition = '';
}

// Show page `index` on top (all pages before it are flipped away)
function showPhoto(index) {
  const n = photoPages.length;
  photoPages.forEach((page, i) => {
    page.classList.toggle('flipped', i < index);
    if (i === index - 1) {
      // The page being flipped must stay above all others during the animation
      page.style.zIndex = String(n + 1);
    } else {
      page.style.zIndex = i < index ? String(i + 1) : String(n - i);
    }
  });
  photoIndex = index;
}

function nextPhoto() {
  if (photoBusy || !photoPages.length) return;
  const n = photoPages.length;

  // Normal case: flip the current page to reveal the next one
  if (photoIndex < n - 1) {
    showPhoto(photoIndex + 1);
    return;
  }

  // Last page: put pages 0..n-2 back underneath instantly, then flip the last page away
  photoBusy = true;
  const last = photoPages[n - 1];
  photoPages.forEach((page, i) => {
    if (i < n - 1) setPageInstant(page, false, n - i);
  });
  last.style.zIndex = String(n + 1); // keep the last page above the others while flipping
  last.classList.add('flipped');

  setTimeout(() => {
    // The last page is now invisible: reset it to the bottom of the stack
    setPageInstant(last, false, 1);
    photoIndex = 0;
    photoBusy = false;
  }, FLIP_MS);
}

function startPhotoBookAutoFlip() {
  nextPhoto();
  setTimeout(startPhotoBookAutoFlip, AUTO_MS);
}

// Initial stacking order: first page on top
photoPages.forEach((page, i) => page.style.zIndex = String(photoPages.length - i));

// Tapping a photo flips to the next one
photoPages.forEach(page => page.addEventListener('click', nextPhoto));

setTimeout(startPhotoBookAutoFlip, AUTO_MS);

/* ─── GESTURES & KEYBOARD ─── */
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goTo(curIdx + 1, 1);
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goTo(curIdx - 1, -1);
});

let touchX = 0;
document.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
document.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchX;
  if (dx < -50) goTo(curIdx + 1, 1); if (dx > 50) goTo(curIdx - 1, -1);
}, { passive: true });

/* ─── START EVENT ─── */
document.getElementById('start-btn').addEventListener('click', () => {
  const reveal = document.getElementById('reveal');

  reveal.classList.add('open-gift');
  
  // Play local background music (started inside a user gesture to satisfy autoplay policy)
  const bgMusic = document.getElementById('bg-music');
  bgMusic.volume = 0.8;
  bgMusic.play().catch(err => console.warn('Audio playback failed:', err));

  setTimeout(() => {
    reveal.classList.add('zoom-in');

    setTimeout(() => {
      reveal.classList.add('gone');

      document.getElementById('nav').style.display = 'flex';
      document.getElementById('hint').style.display = 'block';
      document.getElementById('music-ind').style.display = 'block';

      updateNav();
      autoFw();
      setInterval(spawnShape, 850);

    }, 1000); // thời gian zoom
  }, 1100); // thời gian mở hộp
});