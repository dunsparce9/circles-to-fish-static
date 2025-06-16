$(".window").draggable({
    handle: ".title-bar",
    scroll: false
})
function link1click() {
    window.open("https://github.com/dunsparce9/circles-to-fish-static", '_blank').focus();
}
function link2click() {
    window.open("https://discord.gg/D9ASJv7P", '_blank').focus();
}

function showlogs() {
    const logWin = document.getElementById('logwindow');
    openWindow(logWin);
}

function openfaildialog() {
    const failWin = document.getElementById('dialog-failed');
    openWindow(failWin);
}

function openWindow(window) {
    window.classList.remove('hidden');
    window.classList.add('opening');
    window.addEventListener('animationend', () => {
        window.classList.remove('opening');
    }, { once: true });
    allWindows.forEach(w => w.classList.remove('active'));
    window.classList.add('active');
    highestZ += 1;
    window.style.zIndex = highestZ;
}

function closeWindow(win) {
    win.classList.add('closing');
    win.addEventListener('animationend', () => { win.classList.add('hidden'); win.classList.remove('closing') }, { once: true });
}

document.addEventListener('click', e => {
    if (e.target.matches('[aria-label="Close"]')) {
    const win = e.target.closest('.window');
        closeWindow(win);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const win = document.getElementById('mainwindow');
    win.classList.add('opening');
    win.addEventListener('animationend', () => {
        win.classList.remove('opening');
    }, { once: true });
});

let highestZ = 1;
const allWindows = document.querySelectorAll('.window');

allWindows.forEach(win => {
    win.addEventListener('mousedown', () => {
        allWindows.forEach(w => w.classList.remove('active'));
        win.classList.add('active');
        highestZ += 1;
        win.style.zIndex = highestZ;
    });
});

function copylog() {
    navigator.clipboard.writeText(document.getElementById('logarea').textContent);
    closeWindow(document.getElementById('dialog-failed'));
}