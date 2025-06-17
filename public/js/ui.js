// UI management for draggable windows and dialogs
export function initUI() {
    $(".window").draggable({
        handle: ".title-bar",
        scroll: false
    });

    document.addEventListener('click', e => {
        if (e.target.matches('[aria-label="Close"]')) {
            const win = e.target.closest('.window');
            closeWindow(win);
        }
    });

    allWindows.forEach(win => {
        win.addEventListener('mousedown', () => markActive(win));
    });

    openBuiltinWindow(document.getElementById('log-window'));
    openBuiltinWindow(document.getElementById('main-window'));

    document.getElementById('github-btn').addEventListener('click', openGitHub);
    document.getElementById('discord-btn').addEventListener('click', openDiscord);
    document.getElementById('log-btn').addEventListener('click', showLogs);
    document.getElementById('copylog-btn').addEventListener('click', copyLog);
    document.getElementById('learnmore-btn').addEventListener('click', learnMore);
}

export function openFailDialog() {
    const audio = new Audio('sounds/critical.wav');
    audio.play();
    openWindow(document.getElementById('dialog-failed'));
}

function openGitHub() {
    window.open('https://github.com/dunsparce9/circles-to-fish-static', '_blank').focus();
}

function openDiscord() {
    window.open('https://discord.gg/D9ASJv7P', '_blank').focus();
}

function showLogs() {
    openWindow(document.getElementById('log-window'));
}

function copyLog() {
    navigator.clipboard.writeText(document.getElementById('logarea').textContent);
    closeWindow(document.getElementById('dialog-failed'));
}

function logoError() {
    const audio = new Audio('sounds/critical.wav');
    audio.play();
    openWindow(document.getElementById('dialog-logo'));
}

function learnMore() {
    document.getElementById('fish-body').innerHTML =
        '<iframe width="560" height="315" src="fish.mp4"></iframe>';
    openWindow(document.getElementById('dialog-justafish'));
}

const taskbar = document.getElementById('taskbar');
const taskbarMap = new Map();
const allWindows = document.querySelectorAll('.window');
let highestZ = 1;

function openBuiltinWindow(win) {
    win.classList.add('opening');
    win.addEventListener('animationend', () => {
        win.classList.remove('opening');
    }, { once: true });
    ensureTaskbarItem(win);
    markActive(win);
}

function openWindow(win) {
    win.classList.remove('hidden', 'minimized');
    win.classList.add('opening');
    win.addEventListener('animationend', () => {
        win.classList.remove('opening');
    }, { once: true });
    ensureTaskbarItem(win);
    markActive(win);
}

function closeWindow(win) {
    if (win.id === 'logo-window') {
        logoError();
        return;
    }
    win.classList.add('closing');
    win.addEventListener('animationend', () => {
        win.classList.add('hidden');
        win.classList.remove('closing');
        removeTaskbarItem(win);
    }, { once: true });
}

function markActive(win) {
    allWindows.forEach(w => w.classList.remove('active'));
    document.querySelectorAll('.taskbar-item').forEach(i => i.classList.remove('active'));
    win.classList.add('active');
    const item = taskbarMap.get(win);
    if (item) item.classList.add('active');
    highestZ += 1;
    win.style.zIndex = highestZ;
}

function ensureTaskbarItem(win) {
    if (taskbarMap.has(win)) return;
    const item = document.createElement('div');
    item.className = 'taskbar-item';
    const title = win.querySelector('.title-bar-text').textContent;
    item.innerHTML = `<span class="material-symbols-outlined">window</span><span class="title">${title}</span>`;
    item.addEventListener('click', () => {
        if (win.classList.contains('hidden')) {
            openWindow(win);
        } else if (win.classList.contains('active')) {
            win.classList.add('hidden');
            item.classList.remove('active');
        } else {
            markActive(win);
        }
    });
    item.addEventListener('auxclick', e => {
        if (e.button === 1) {
            closeWindow(win);
        }
    });
    taskbar.appendChild(item);
    taskbarMap.set(win, item);
}

function removeTaskbarItem(win) {
    const item = taskbarMap.get(win);
    if (item) item.remove();
    taskbarMap.delete(win);
}
