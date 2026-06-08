/* ============================================================
   main-standalone.js — shared behaviour for standalone pages
   Personal contact/social/CV references removed.
   Terminal, game, matrix rain, and Konami easter egg kept.
   ============================================================ */

function toggleSidebarMenu() {
    const drawer = document.getElementById('sidebarDrawer');
    const hook = document.getElementById('drawerHook');
    if (!drawer) return;
    const open = drawer.classList.toggle('active');
    if (hook) {
        hook.textContent = open ? 'CLOSE' : 'MENU';
        hook.style.left = open ? '340px' : '20px';
        hook.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
}

const AUDIO_KEY = 'mn_audio_state';

function controlAudio() {
    const s = document.getElementById('audioSource');
    if (!s) return;
    s.paused ? s.play() : s.pause();
}

function navigateAudio(e) {
    const s = document.getElementById('audioSource');
    const bar = document.getElementById('trackBar');
    if (!s || !bar || !s.duration) return;
    s.currentTime = (e.offsetX / bar.clientWidth) * s.duration;
}

function syncAudioButton() {
    const s = document.getElementById('audioSource');
    const btn = document.getElementById('playBtn');
    if (!s || !btn) return;
    btn.textContent = s.paused ? '▶' : '❚❚';
    btn.setAttribute('aria-label', s.paused ? 'Play audio' : 'Pause audio');
}

function saveAudioState() {
    const s = document.getElementById('audioSource');
    if (!s) return;
    try { localStorage.setItem(AUDIO_KEY, JSON.stringify({ time: s.currentTime || 0, playing: !s.paused })); } catch (e) {}
}

function initAudio() {
    const s = document.getElementById('audioSource');
    if (!s) return;
    const fill = document.getElementById('trackFill');
    let state = {};
    try { state = JSON.parse(localStorage.getItem(AUDIO_KEY)) || {}; } catch (e) {}
    const applyState = () => {
        if (state.time && isFinite(state.time)) { try { s.currentTime = state.time; } catch (e) {} }
        if (state.playing) s.play().catch(() => {});
        syncAudioButton();
    };
    if (s.readyState >= 1) applyState();
    else s.addEventListener('loadedmetadata', applyState, { once: true });
    s.addEventListener('timeupdate', () => { if (fill && s.duration) fill.style.width = (s.currentTime / s.duration) * 100 + '%'; });
    s.addEventListener('play', () => { syncAudioButton(); saveAudioState(); });
    s.addEventListener('pause', () => { syncAudioButton(); saveAudioState(); });
    setInterval(saveAudioState, 2000);
    window.addEventListener('beforeunload', saveAudioState);
    syncAudioButton();
}

function initClock() {
    const el = document.getElementById('liveClock');
    if (!el) return;
    const tick = () => el.textContent = new Date().toLocaleTimeString();
    tick(); setInterval(tick, 1000);
}

function initActiveNav() {
    const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    document.querySelectorAll('.sidebar-drawer a').forEach(a => {
        const target = (a.getAttribute('href') || '').toLowerCase();
        if (target === here || ((here === '' || here === 'index.html') && target === 'index.html')) {
            a.classList.add('active'); a.setAttribute('aria-current', 'page');
        }
    });
}

function initScrollTop() {
    const btn = document.createElement('button');
    btn.className = 'scroll-top-btn'; btn.setAttribute('aria-label', 'Scroll to top'); btn.innerHTML = '↑';
    document.body.appendChild(btn);
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    const toggle = () => btn.classList.toggle('visible', window.scrollY > 400);
    window.addEventListener('scroll', toggle, { passive: true }); toggle();
}

function initKeyboard() {
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            const drawer = document.getElementById('sidebarDrawer');
            if (drawer && drawer.classList.contains('active')) toggleSidebarMenu();
        }
    });
}

function initCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ring = document.createElement('div'); ring.className = 'cursor-ring'; document.body.appendChild(ring);
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
    document.addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; });
    document.addEventListener('mousedown', () => ring.classList.add('down'));
    document.addEventListener('mouseup', () => ring.classList.remove('down'));
    (function loop() { rx += (x - rx) * 0.18; ry += (y - ry) * 0.18; ring.style.transform = `translate(${rx}px, ${ry}px)`; requestAnimationFrame(loop); })();
}

function initCountUp() {
    const els = document.querySelectorAll('[data-count]');
    if (!els.length || !('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver(entries => {
        entries.forEach(en => {
            if (!en.isIntersecting) return;
            const el = en.target, target = parseFloat(el.dataset.count) || 0, suffix = el.dataset.suffix || '', dur = 1300, t0 = performance.now();
            (function step(now) { const p = Math.min((now - t0) / dur, 1); el.textContent = Math.floor(p * target) + suffix; if (p < 1) requestAnimationFrame(step); else el.textContent = target + suffix; })(t0);
            obs.unobserve(el);
        });
    }, { threshold: 0.4 });
    els.forEach(el => obs.observe(el));
}

function showToast(msg, ms) {
    let host = document.getElementById('toastHost');
    if (!host) { host = document.createElement('div'); host.id = 'toastHost'; document.body.appendChild(host); }
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; host.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, ms || 3200);
}

/* ============================================================ Konami easter egg ============================================================ */
const DEV_KEY = 'mn_devmode';

function matrixRain() {
    if (document.querySelector('.matrix-rain')) return;
    const cv = document.createElement('canvas'); cv.className = 'matrix-rain'; document.body.appendChild(cv);
    const ctx = cv.getContext('2d');
    const chars = 'アイウエオカキクケコサシスセソタチツテト0123456789ﾊﾋﾌﾍﾎ@#$%&';
    let w, h, cols, drops;
    function resize() { w = cv.width = innerWidth; h = cv.height = innerHeight; cols = Math.floor(w / 16); drops = new Array(cols).fill(0).map(() => Math.random() * -50); }
    resize(); window.addEventListener('resize', resize);
    const start = performance.now(); let raf;
    (function draw(now) {
        ctx.fillStyle = 'rgba(0,0,0,0.09)'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#00ff8c'; ctx.font = '15px monospace';
        for (let i = 0; i < cols; i++) { ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 16, drops[i] * 16); if (drops[i] * 16 > h && Math.random() > 0.975) drops[i] = 0; drops[i]++; }
        const t = (now - start) / 1000;
        if (t > 5.5) cv.style.opacity = Math.max(0, 1 - (t - 5.5));
        if (t > 6.5) { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); cv.remove(); return; }
        raf = requestAnimationFrame(draw);
    })(start);
}

function injectClassifiedLink() {
    document.querySelectorAll('.sidebar-drawer').forEach(nav => {
        if (nav.querySelector('.classified-link')) return;
        const a = document.createElement('a'); a.href = 'classified.html'; a.className = 'classified-link'; a.textContent = '☣ CLASSIFIED'; nav.appendChild(a);
    });
}

function applyDevMode(on, announce) {
    document.body.classList.toggle('dev-mode', on);
    if (on) { injectClassifiedLink(); try { sessionStorage.setItem(DEV_KEY, '1'); } catch (e) {} }
    else { document.querySelectorAll('.classified-link').forEach(a => a.remove()); try { sessionStorage.removeItem(DEV_KEY); } catch (e) {} }
    if (announce) showToast(on ? '\u{1F3AE} DEVELOPER MODE UNLOCKED' : 'Developer mode disabled');
}

function isReload() {
    try { const nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0]; if (nav) return nav.type === 'reload'; return performance.navigation && performance.navigation.type === 1; } catch (e) { return false; }
}

function initDevModePersist() {
    try { localStorage.removeItem(DEV_KEY); } catch (e) {}
    if (isReload()) { try { sessionStorage.removeItem(DEV_KEY); } catch (e) {} return; }
    try { if (sessionStorage.getItem(DEV_KEY)) applyDevMode(true, false); } catch (e) {}
}

function devEsc(e) { if (e.key === 'Escape') closeDevConsole(); }
function closeDevConsole() { const p = document.getElementById('devConsole'); if (p) p.classList.remove('show'); }
function openDevConsole() {
    let p = document.getElementById('devConsole');
    if (!p) {
        p = document.createElement('div'); p.id = 'devConsole';
        const cmdRows = COMMANDS.map(c => '<li><code>' + c[0] + '</code><span>' + c[1] + '</span></li>').join('');
        p.innerHTML =
            '<div class="dev-console-inner glass-panel">' +
                '<button class="dev-close" aria-label="Close">✕</button>' +
                '<h2>// DEV CONSOLE</h2>' +
                '<p class="dev-lead">&gt; ACCESS GRANTED. Welcome to the back door, operator.</p>' +
                '<p>You found the secret. Hand-built with vanilla JavaScript &amp; CSS, no frameworks.</p>' +
                '<p class="section-label">Terminal Commands</p>' +
                '<ul class="dev-cmds">' + cmdRows + '</ul>' +
                '<p class="dev-tip">Tip: press the <code>`</code> key anytime in dev mode to toggle the terminal.</p>' +
                '<p class="section-label">Credits</p>' +
                '<div class="dev-credits"><ul>' +
                    '<li>Design, code &amp; music: Error404404 Studios</li>' +
                    '<li>Type: Orbitron &amp; Space Grotesk</li>' +
                    '<li>Inspired by cyberpunk / terminal UIs</li>' +
                '</ul></div>' +
                '<div class="dev-actions">' +
                    '<button class="btn-prime" id="devTermBtn">⌨ Open Terminal</button>' +
                    '<button class="btn-sec" id="devGameBtn">▶ Asteroids-Mini</button>' +
                    '<a class="btn-sec" href="classified.html">☣ Classified Vault</a>' +
                    '<button class="btn-sec" id="devDisableBtn">Disable Dev Mode</button>' +
                '</div>' +
            '</div>';
        document.body.appendChild(p);
        p.querySelector('.dev-close').addEventListener('click', closeDevConsole);
        p.addEventListener('click', e => { if (e.target === p) closeDevConsole(); });
        p.querySelector('#devTermBtn').addEventListener('click', () => { closeDevConsole(); openTerminal(); });
        p.querySelector('#devGameBtn').addEventListener('click', () => { closeDevConsole(); launchMiniGame(); });
        p.querySelector('#devDisableBtn').addEventListener('click', () => { applyDevMode(false, true); closeDevConsole(); });
        document.addEventListener('keydown', devEsc);
    }
    requestAnimationFrame(() => p.classList.add('show'));
}

function launchMiniGame() {
    if (document.getElementById('miniGame')) return;
    const wrap = document.createElement('div'); wrap.id = 'miniGame';
    wrap.innerHTML = '<div class="mini-inner"><div class="mini-bar"><span>ASTEROIDS-MINI</span><span id="miniScore">SCORE 0</span><button id="miniClose">✕ ESC</button></div><canvas id="miniCanvas" width="640" height="420"></canvas><div class="mini-help">← → rotate · ↑ thrust · SPACE fire · R restart · ESC quit</div></div>';
    document.body.appendChild(wrap); requestAnimationFrame(() => wrap.classList.add('show'));
    const cv = wrap.querySelector('#miniCanvas'), ctx = cv.getContext('2d'), W = cv.width, H = cv.height;
    const ship = { x: W / 2, y: H / 2, a: -Math.PI / 2, vx: 0, vy: 0, r: 10 };
    let bullets = [], rocks = [], score = 0, over = false, raf; const keys = {};
    const wrapPos = o => { if (o.x < 0) o.x += W; if (o.x > W) o.x -= W; if (o.y < 0) o.y += H; if (o.y > H) o.y -= H; };
    function spawn(n) { for (let i = 0; i < n; i++) { const e = Math.random() * 6.28; rocks.push({ x: Math.random() < 0.5 ? 0 : W, y: Math.random() * H, vx: Math.cos(e) * 1.2, vy: Math.sin(e) * 1.2, r: 26 }); } }
    function reset() { ship.x = W/2; ship.y = H/2; ship.vx = ship.vy = 0; ship.a = -Math.PI/2; bullets = []; rocks = []; score = 0; over = false; spawn(4); }
    spawn(4);
    function onKey(e, d) {
        const k = e.key; if (['ArrowLeft','ArrowRight','ArrowUp',' '].includes(k)) e.preventDefault();
        if (k==='ArrowLeft') keys.l=d; if (k==='ArrowRight') keys.r=d; if (k==='ArrowUp') keys.t=d;
        if (k===' '&&d&&!over) bullets.push({x:ship.x+Math.cos(ship.a)*12,y:ship.y+Math.sin(ship.a)*12,vx:Math.cos(ship.a)*6+ship.vx,vy:Math.sin(ship.a)*6+ship.vy,life:55});
        if ((k==='r'||k==='R')&&over) reset(); if (k==='Escape') close();
    }
    const kd = e=>onKey(e,true), ku = e=>onKey(e,false);
    document.addEventListener('keydown',kd); document.addEventListener('keyup',ku);
    function close() { cancelAnimationFrame(raf); document.removeEventListener('keydown',kd); document.removeEventListener('keyup',ku); wrap.classList.remove('show'); setTimeout(()=>wrap.remove(),300); }
    wrap.querySelector('#miniClose').addEventListener('click', close);
    (function loop() {
        raf = requestAnimationFrame(loop); ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H);
        if (!over) { if(keys.l)ship.a-=0.06; if(keys.r)ship.a+=0.06; if(keys.t){ship.vx+=Math.cos(ship.a)*0.12;ship.vy+=Math.sin(ship.a)*0.12;} ship.vx*=0.99;ship.vy*=0.99;ship.x+=ship.vx;ship.y+=ship.vy;wrapPos(ship); }
        bullets.forEach(b=>{b.x+=b.vx;b.y+=b.vy;b.life--;wrapPos(b);}); bullets=bullets.filter(b=>b.life>0);
        rocks.forEach(r=>{r.x+=r.vx;r.y+=r.vy;wrapPos(r);});
        for (let i=rocks.length-1;i>=0;i--) { for(let j=bullets.length-1;j>=0;j--) { const dx=rocks[i].x-bullets[j].x,dy=rocks[i].y-bullets[j].y; if(dx*dx+dy*dy<rocks[i].r*rocks[i].r){bullets.splice(j,1);score+=10;if(rocks[i].r>14)for(let s=0;s<2;s++){const e=Math.random()*6.28;rocks.push({x:rocks[i].x,y:rocks[i].y,vx:Math.cos(e)*1.9,vy:Math.sin(e)*1.9,r:rocks[i].r/2});}rocks.splice(i,1);break;}}}
        if(!over)for(const r of rocks){const dx=r.x-ship.x,dy=r.y-ship.y;if(dx*dx+dy*dy<(r.r+ship.r)*(r.r+ship.r))over=true;}
        if(rocks.length===0)spawn(5);
        if(!over){ctx.save();ctx.translate(ship.x,ship.y);ctx.rotate(ship.a);ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(14,0);ctx.lineTo(-10,8);ctx.lineTo(-6,0);ctx.lineTo(-10,-8);ctx.closePath();ctx.stroke();if(keys.t){ctx.strokeStyle='#ff8c00';ctx.beginPath();ctx.moveTo(-6,0);ctx.lineTo(-15,0);ctx.stroke();}ctx.restore();}
        ctx.fillStyle='#fff';bullets.forEach(b=>ctx.fillRect(b.x-1.5,b.y-1.5,3,3));
        ctx.strokeStyle='#bbb';ctx.lineWidth=2;rocks.forEach(r=>{ctx.beginPath();ctx.arc(r.x,r.y,r.r,0,6.28);ctx.stroke();});
        wrap.querySelector('#miniScore').textContent='SCORE '+score;
        if(over){ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='28px Orbitron,monospace';ctx.fillText('GAME OVER',W/2,H/2-8);ctx.font='13px monospace';ctx.fillText('Press R to restart  ·  ESC to quit',W/2,H/2+20);ctx.textAlign='left';}
    })();
}

/* ============================================================ Terminal ============================================================ */
const TERM_NAV = {
    home: 'index.html', root: 'index.html', index: 'index.html',
    radio: 'Radio.html',
    feeds: 'Feeds.html',
    cmd: 'cmd.html',
    classified: 'classified.html', vault: 'classified.html'
};
const TERM_SOCIAL = {};
const COMMANDS = [
    ['help',       'List every command'],
    ['ls',         'List sections'],
    ['open <name>','Go to a page (radio, feeds, cmd, classified)'],
    ['radio',      'Open the radio station'],
    ['cmd',        'Open the command deck'],
    ['game',       'Launch Asteroids-Mini'],
    ['matrix',     'Run the matrix-rain effect'],
    ['theme',      'Toggle developer (green) mode'],
    ['reboot',     'Replay the boot sequence'],
    ['clear',      'Clear the terminal'],
    ['exit',       'Close the terminal']
];

function escapeHtml(s) { return String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }

function termHelpInto(print) {
    print('Available commands:', 'term-dim');
    COMMANDS.forEach(c => print('<span class="term-cmd">'+c[0].padEnd(14)+'</span><span class="term-dim">'+c[1]+'</span>'));
}

function runCommandInto(raw, ctx) {
    const print = ctx.print;
    const input = (raw || '').trim();
    print('<span class="term-prompt">operator@error404404:~$</span> ' + escapeHtml(input));
    if (!input) return;
    const parts = input.split(/\s+/), cmd = parts[0].toLowerCase(), arg = (parts[1]||'').toLowerCase();
    const go = (url, msg) => { print(msg, 'term-ok'); setTimeout(() => { location.href = url; }, 450); };
    switch (cmd) {
        case 'help': case '?': case 'commands': termHelpInto(print); break;
        case 'ls': case 'dir': print('radio  feeds  cmd  classified'); break;
        case 'open': case 'cd': case 'goto':
            if (TERM_NAV[arg]) go(TERM_NAV[arg], 'Opening '+arg+'…');
            else print('No such page: '+(arg||'(none)')+" — try 'ls'", 'term-err'); break;
        case 'home': go('index.html', 'Returning to base…'); break;
        case 'radio': go('Radio.html', 'Tuning in…'); break;
        case 'cmd': case 'terminal': go('cmd.html', 'Opening command deck…'); break;
        case 'game': case 'asteroids': print('Launching Asteroids-Mini…', 'term-ok'); launchMiniGame(); break;
        case 'matrix': print('Wake up, operator.', 'term-ok'); matrixRain(); break;
        case 'theme': case 'devmode': applyDevMode(!document.body.classList.contains('dev-mode'), true); print('Theme toggled.', 'term-ok'); break;
        case 'reboot': case 'boot': print('Rebooting…', 'term-ok'); if (ctx.close) ctx.close(); runBoot(true); break;
        case 'echo': print(escapeHtml(parts.slice(1).join(' '))); break;
        case 'date': case 'time': print(new Date().toString()); break;
        case 'clear': case 'cls': ctx.clear(); break;
        case 'exit': case 'quit': case 'close': if (ctx.close) ctx.close(); else print('(embedded terminal — nothing to close)', 'term-dim'); break;
        default: {
            const names = COMMANDS.map(c => c[0].split(' ')[0]);
            const near = names.find(n => n.startsWith(cmd)) || names.find(n => cmd.length > 2 && n.indexOf(cmd) >= 0);
            print('command not found: '+escapeHtml(cmd)+(near ? " — did you mean '"+near+"'?" : " — type 'help'"), 'term-err');
        }
    }
}

function mountTerminal(outEl, inEl, onClose) {
    let hist = [], hi = 0;
    const print = (html, cls) => { const line = document.createElement('div'); line.className = 'term-line'+(cls?' '+cls:''); line.innerHTML = html; outEl.appendChild(line); outEl.scrollTop = outEl.scrollHeight; };
    const ctx = { print, clear: () => { outEl.innerHTML = ''; }, close: onClose };
    outEl.addEventListener('click', () => inEl.focus());
    inEl.addEventListener('keydown', e => {
        e.stopPropagation();
        if (e.key === 'Enter') { const v = inEl.value; inEl.value = ''; if (v.trim()) { hist.push(v); hi = hist.length; } runCommandInto(v, ctx); }
        else if (e.key === 'ArrowUp') { if (hi > 0) { hi--; inEl.value = hist[hi]||''; } e.preventDefault(); }
        else if (e.key === 'ArrowDown') { if (hi < hist.length-1) { hi++; inEl.value = hist[hi]||''; } else { hi = hist.length; inEl.value = ''; } e.preventDefault(); }
        else if (e.key === 'Tab') { e.preventDefault(); const v = inEl.value.trim().toLowerCase(); if (v) { const m = COMMANDS.map(c=>c[0].split(' ')[0]).find(n=>n.startsWith(v)); if (m) inEl.value = m+' '; } }
        else if (e.key === 'Escape' && onClose) { onClose(); }
    });
    print('ERROR404404 // SYSTEM TERMINAL v1.0', 'term-ok');
    print("Type a command and press Enter. Try <span class='term-cmd'>help</span>. (Tab completes · ↑/↓ history)", 'term-dim');
    termHelpInto(print);
    return ctx;
}

function openTerminal() {
    let t = document.getElementById('terminal');
    if (!t) {
        t = document.createElement('div'); t.id = 'terminal';
        t.innerHTML = '<div class="term-bar"><span>ERROR404404 // TERMINAL</span><button id="termClose" aria-label="Close">✕</button></div><div id="termOut" class="term-out"></div><div class="term-input-row"><span class="term-prompt">operator@error404404:~$</span><input id="termIn" class="term-in" autocomplete="off" spellcheck="false" aria-label="Terminal input" /></div>';
        document.body.appendChild(t);
        t.querySelector('#termClose').addEventListener('click', closeTerminal);
        mountTerminal(t.querySelector('#termOut'), t.querySelector('#termIn'), closeTerminal);
    }
    t.classList.add('show');
    setTimeout(() => { const i = document.getElementById('termIn'); if (i) i.focus(); }, 60);
}
function closeTerminal() { const t = document.getElementById('terminal'); if (t) t.classList.remove('show'); }
function toggleTerminal() { const t = document.getElementById('terminal'); if (t && t.classList.contains('show')) closeTerminal(); else openTerminal(); }
function initTerminalHotkey() {
    document.addEventListener('keydown', e => {
        if (e.key !== '`' && e.key !== '~') return;
        if (!document.body.classList.contains('dev-mode')) return;
        if (/^(input|textarea)$/i.test(e.target.tagName)) return;
        e.preventDefault(); toggleTerminal();
    });
}

function initEmbeddedTerminals() {
    document.querySelectorAll('[data-terminal]').forEach(host => {
        if (host.dataset.mounted) return;
        host.dataset.mounted = '1';
        host.innerHTML = '<div class="term-out"></div><div class="term-input-row"><span class="term-prompt">operator@error404404:~$</span><input class="term-in" autocomplete="off" spellcheck="false" aria-label="Terminal input" /></div>';
        mountTerminal(host.querySelector('.term-out'), host.querySelector('.term-in'), null);
    });
}

function unlockDevMode() { matrixRain(); applyDevMode(true, true); setTimeout(openDevConsole, 1400); }
function initKonami() {
    const seq = ['arrowup','arrowup','arrowdown','arrowdown','arrowleft','arrowright','arrowleft','arrowright','b','a'];
    let pos = 0;
    document.addEventListener('keydown', e => {
        if (/^(input|textarea)$/i.test(e.target.tagName)) return;
        const k = (e.key||'').toLowerCase();
        if (k === seq[pos]) { if (++pos === seq.length) { pos = 0; unlockDevMode(); } } else { pos = (k===seq[0]) ? 1 : 0; }
    });
}

function runBoot(force) {
    if (!force) {
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { try { sessionStorage.setItem('mn_booted','1'); } catch(e){} return; }
        let booted = false; try { booted = !!sessionStorage.getItem('mn_booted'); } catch(e){}
        if (booted && !isReload()) return;
    }
    if (!document.body) return;
    const prev = document.getElementById('bootScreen'); if (prev) prev.remove();
    const lines = ['ERROR404404 STUDIOS // SYSTEM MATRIX','> POST check .............. OK','> Loading kernel modules .. OK','> Mounting /vaults ........ OK','> Mounting /Songs ......... OK','> Establishing uplink ..... OK','> Decrypting portfolio .... OK','> Boot complete. Welcome, operator.'];
    const screen = document.createElement('div'); screen.id = 'bootScreen';
    screen.innerHTML = '<div class="boot-inner"><pre id="bootLog"></pre><div class="boot-bar"><div class="boot-bar-fill" id="bootBar"></div></div><div class="boot-skip">PRESS [ESC] TO SKIP</div></div>';
    document.body.appendChild(screen); document.body.classList.add('booting');
    const log = screen.querySelector('#bootLog'), bar = screen.querySelector('#bootBar');
    let i = 0, done = false;
    function finish() { if (done) return; done=true; try{sessionStorage.setItem('mn_booted','1');}catch(e){} screen.classList.add('done'); document.body.classList.remove('booting'); document.removeEventListener('keydown', onKey); setTimeout(()=>screen.remove(),600); }
    function onKey(e) { if (e.key==='Escape') finish(); }
    document.addEventListener('keydown', onKey); screen.addEventListener('click', finish);
    (function typeLine() { if(done)return; if(i>=lines.length){bar.style.width='100%';setTimeout(finish,600);return;} log.textContent+=(i?'\n':'')+lines[i]; i++; bar.style.width=Math.round(i/lines.length*100)+'%'; setTimeout(typeLine,260); })();
}

document.addEventListener('DOMContentLoaded', () => {
    initClock(); initAudio(); initActiveNav(); initScrollTop(); initKeyboard();
    initCursor(); initCountUp(); initKonami(); initDevModePersist();
    initTerminalHotkey(); initEmbeddedTerminals();
});

runBoot();
