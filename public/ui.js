$(".window").draggable({
    handle: ".title-bar",
    scroll: false
})
const taskbar = document.getElementById('taskbar');
const taskbarMap = new Map();
function link1click() {
    window.open("https://github.com/dunsparce9/circles-to-fish-static", '_blank').focus();
}
function link2click() {
    window.open("https://discord.gg/D9ASJv7P", '_blank').focus();
}

function showlogs() {
    const logWin = document.getElementById('log-window');
    openWindow(logWin);
}

function openfaildialog() {
    var audio = new Audio('sounds/critical.wav');
    audio.play();
    const failWin = document.getElementById('dialog-failed');
    openWindow(failWin);
}

function openWindow(window) {
    window.classList.remove('hidden');
    window.classList.remove('minimized');
    window.classList.add('opening');
    window.addEventListener('animationend', () => {
        window.classList.remove('opening');
    }, { once: true });
    ensureTaskbarItem(window);
    markActive(window);
}

function closeWindow(win) {
    if (win.id == "logo-window") {
        logoerror();
        return;
    }
    win.classList.add('closing');
    win.addEventListener('animationend', () => { 
        win.classList.add('hidden'); 
        win.classList.remove('closing'); 
        removeTaskbarItem(win);
    }, { once: true });
}

document.addEventListener('click', e => {
    if (e.target.matches('[aria-label="Close"]')) {
        const win = e.target.closest('.window');
        closeWindow(win);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    openBuiltinWindow(document.getElementById('main-window'));
    openBuiltinWindow(document.getElementById('log-window'));
});

function openBuiltinWindow(win) {
    win.classList.add('opening');
    win.addEventListener('animationend', () => {
        win.classList.remove('opening');
    }, { once: true });
    ensureTaskbarItem(win);
    markActive(win);
}

let highestZ = 1;
const allWindows = document.querySelectorAll('.window');

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
        } else {
            win.classList.add('hidden');
            item.classList.remove('active');
        }
    });
    item.addEventListener('auxclick', (e) => {
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

allWindows.forEach(win => {
    win.addEventListener('mousedown', () => {
        markActive(win);
    });
});

function copylog() {
    navigator.clipboard.writeText(document.getElementById('logarea').textContent);
    closeWindow(document.getElementById('dialog-failed'));
}

function logoerror() {
    var audio = new Audio('sounds/critical.wav');
    audio.play();
    const failWin = document.getElementById('dialog-logo');
    openWindow(failWin);
}

function learnmore() {
    document.getElementById("fish-body").innerHTML = `<iframe width="560" height="315" src="fish.mp4"</iframe>`
    const fishWin = document.getElementById('dialog-justafish');
    openWindow(fishWin);
}
