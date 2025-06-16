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
    var audio = new Audio('sounds/critical.wav');
    audio.play();
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
    if (win.id == "logo-window") {
        logoerror();
        return;
    }
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

function logoerror() {
    var audio = new Audio('sounds/critical.wav');
    audio.play();
    const failWin = document.getElementById('dialog-logo');
    openWindow(failWin);
}

function learnmore() {
    document.getElementById("fish-body").innerHTML = `<iframe width="560" height="315" src="https://www.youtube.com/embed/1goAp0XmhZQ?si=-ulNzP7rVx2_-x7g&autoplay=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`
    const fishWin = document.getElementById('dialog-justafish');
    openWindow(fishWin);
}