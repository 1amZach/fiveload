const cfg = window.LOADING || {};
const $ = (id) => document.getElementById(id);

// ------------------------------------------------------------------ branding

document.documentElement.style.setProperty('--accent', cfg.accent || '#9c2cf1');
document.documentElement.style.setProperty('--accent2', cfg.accent2 || '#2bd9cc');
$('logo').src = cfg.logo || 'logo.svg';
$('name').textContent = cfg.name || '';
$('tagline').textContent = cfg.tagline || '';

// ------------------------------------------------------------------ backgrounds

(function backgrounds() {
    const list = cfg.backgrounds || [];
    if (!list.length) return;
    const bg = $('bg');
    bg.classList.add('media');

    const slides = list.map((file) => {
        const video = /\.(webm|mp4)$/i.test(file);
        const el = document.createElement(video ? 'video' : 'img');
        el.className = 'slide';
        el.src = file;
        if (video) Object.assign(el, { muted: true, loop: true, playsInline: true });
        bg.appendChild(el);
        return el;
    });

    let i = 0;
    const show = () => {
        slides.forEach((s, n) => {
            s.classList.toggle('on', n === i);
            if (s.tagName === 'VIDEO') n === i ? s.play().catch(() => {}) : s.pause();
        });
    };
    show();
    if (slides.length > 1) setInterval(() => ((i = (i + 1) % slides.length), show()), (cfg.slideSeconds || 9) * 1000);
})();

// ------------------------------------------------------------------ tips

(function tips() {
    const list = cfg.tips || [];
    if (!list.length) return;
    const el = $('tip');
    let i = Math.floor(Math.random() * list.length);
    el.textContent = list[i];
    setInterval(() => {
        el.classList.add('fade');
        setTimeout(() => {
            i = (i + 1) % list.length;
            el.textContent = list[i];
            el.classList.remove('fade');
        }, 500);
    }, (cfg.tipSeconds || 7) * 1000);
})();

// ------------------------------------------------------------------ links and announcements

function openLink(url) {
    // FiveM opens links in the player's browser this way
    if (window.invokeNative) window.invokeNative('openUrl', url);
    else window.open(url, '_blank');
}

(function links() {
    const nav = $('links');
    (cfg.links || []).filter((l) => l.url).forEach((l, n) => {
        const b = document.createElement('button');
        b.textContent = l.label;
        if (n === 0) b.className = 'first';
        b.onclick = () => openLink(l.url);
        nav.appendChild(b);
    });
})();

function panel(title, text, meta) {
    const s = document.createElement('section');
    s.className = 'panel';
    const h = document.createElement('h2');
    h.textContent = title;
    const p = document.createElement('p');
    p.textContent = text;
    s.append(h, p);
    if (meta) {
        const m = document.createElement('span');
        m.className = 'meta';
        m.textContent = meta;
        s.append(m);
    }
    return s;
}

(cfg.announcements || []).forEach((a) => $('announcements').appendChild(panel(a.title, a.text)));

// ------------------------------------------------------------------ server info

function duration(s) {
    s = Math.round(s);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    return m < 60 ? `${m}m ${s % 60}s` : `${Math.floor(m / 60)}h ${m % 60}m`;
}

function ago(at) {
    const s = Date.now() / 1000 - at;
    if (s < 3600) return `${Math.max(1, Math.round(s / 60))} minutes ago`;
    if (s < 86400) return `${Math.round(s / 3600)} hours ago`;
    return `${Math.round(s / 86400)} days ago`;
}

function handover(data) {
    if (!data) return;
    const server = data.server;
    if (server) {
        $('info').hidden = false;
        $('players').textContent = `${server.players}/${server.max}`;
        if (server.name && !cfg.name) $('name').textContent = server.name;
        if (typeof server.staff === 'number') {
            $('staffStat').hidden = false;
            $('staff').textContent = server.staff;
        }
    }
    if (data.queue && data.queue.waited >= 5) {
        $('info').hidden = false;
        const q = $('queue');
        q.hidden = false;
        q.textContent = 'You waited ';
        const b = document.createElement('strong');
        b.textContent = duration(data.queue.waited);
        q.append(b, ` in the queue${data.queue.priority ? ` with ${data.queue.priority} priority` : ''}.`);
    }
    if (data.news && data.news.text) {
        $('news').hidden = false;
        $('newsText').textContent = data.news.text;
        $('newsMeta').textContent = `${data.news.author} · ${ago(data.news.at)}`;
    }
}

handover(window.nuiHandoverData);

// ------------------------------------------------------------------ progress

// Where each loading stage starts and ends on the bar.
const stages = {
    INIT_CORE: [0, 6, 'Starting up'],
    INIT_BEFORE_MAP_LOADED: [6, 18, 'Getting ready'],
    MAP: [18, 78, 'Loading the city'],
    INIT_AFTER_MAP_LOADED: [78, 90, 'Setting up the world'],
    INIT_SESSION: [90, 99, 'Joining the server'],
};

const load = { stage: 'INIT_CORE', count: 1, done: 0, shown: 0 };

function setStage(type) {
    if (!stages[type] || stages[type][0] < stages[load.stage][0]) return;
    if (type !== load.stage) load.done = 0;
    load.stage = type;
    $('stage').textContent = stages[type][2];
}

function render(fraction) {
    const [from, to] = stages[load.stage];
    const value = Math.max(load.shown, Math.min(to, from + (to - from) * Math.min(1, fraction)));
    load.shown = value;
    $('fill').style.width = `${value}%`;
    $('percent').textContent = `${Math.floor(value)}%`;
}

const events = {
    startInitFunctionOrder(d) {
        setStage(d.type);
        load.count = d.count || 1;
        load.done = 0;
        render(0);
    },
    initFunctionInvoking(d) {
        load.done = Math.max(load.done, (d.idx || 0) + 1);
        render(load.done / load.count);
    },
    startDataFileEntries(d) {
        setStage('MAP');
        load.count = d.count || 1;
        load.done = 0;
    },
    onDataFileEntry() {
        load.done++;
        render(load.done / load.count);
    },
    performMapLoadFunction(d) {
        setStage('MAP');
        render(((d.idx || 0) + 1) / Math.max(load.count, (d.idx || 0) + 2));
    },
    loadProgress(d) {
        // overall progress from the game itself, never lets the bar go backwards
        const overall = Math.min(99, (d.loadFraction || 0) * 100);
        if (overall > load.shown) {
            load.shown = overall;
            $('fill').style.width = `${overall}%`;
            $('percent').textContent = `${Math.floor(overall)}%`;
        }
    },
    onLogLine(d) {
        if (d.message) $('log').textContent = d.message.replace(/\.\.\.$/, '…');
    },
};

window.addEventListener('message', (e) => {
    const d = e.data || {};
    if (d.fiveload === 'done') return finish();
    const fn = events[d.eventName];
    if (fn) fn(d);
});

function finish() {
    load.shown = 100;
    $('fill').style.width = '100%';
    $('percent').textContent = '100%';
    $('stage').textContent = 'Ready';
    fadeMusic();
    setTimeout(() => document.body.classList.add('done'), 150);
}

// ------------------------------------------------------------------ music

const audio = $('audio');
const songs = (cfg.music || []).slice();
let song = 0;

function store(key, value) {
    try {
        if (value === undefined) return localStorage.getItem(key);
        localStorage.setItem(key, value);
    } catch {
        return null;
    }
}

function playSong(n) {
    song = (n + songs.length) % songs.length;
    const s = songs[song];
    audio.src = s.file;
    $('track').textContent = s.title || s.file.split('/').pop();
    $('artist').textContent = s.artist || '';
    audio.play().catch(() => {});
}

function fadeMusic() {
    const start = audio.volume;
    let step = 0;
    const t = setInterval(() => {
        step++;
        audio.volume = Math.max(0, start * (1 - step / 10));
        if (step >= 10) clearInterval(t);
    }, 80);
}

if (songs.length) {
    if (cfg.shuffle) songs.sort(() => Math.random() - 0.5);
    $('music').hidden = false;

    const saved = parseFloat(store('fiveload:volume'));
    audio.volume = Number.isFinite(saved) ? saved : cfg.volume ?? 0.3;
    $('volume').value = audio.volume;

    $('volume').oninput = (e) => {
        audio.volume = Number(e.target.value);
        store('fiveload:volume', String(audio.volume));
    };
    $('play').onclick = () => (audio.paused ? audio.play().catch(() => {}) : audio.pause());
    $('next').onclick = () => playSong(song + 1);
    $('prev').onclick = () => playSong(song - 1);
    audio.onended = () => playSong(song + 1);
    const icons = {
        pause: '<svg viewBox="0 0 24 24"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>',
        play: '<svg viewBox="0 0 24 24"><path d="M7 4v16l13-8z"/></svg>',
    };
    audio.onplay = () => ($('play').innerHTML = icons.pause);
    audio.onpause = () => ($('play').innerHTML = icons.play);

    // space toggles music, the common habit on loading screens
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') audio.paused ? audio.play().catch(() => {}) : audio.pause();
    });

    playSong(0);
}
