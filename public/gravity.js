document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('gravity-btn');
    if (!btn) return;
    const area = document.getElementById('window-area');
    let gravityMode = false;

    function convertToAbsolute() {
        const bounds = area.getBoundingClientRect();
        document.querySelectorAll('.window').forEach(w => {
            const r = w.getBoundingClientRect();
            w.style.position = 'absolute';
            w.style.left = (r.left - bounds.left) + 'px';
            w.style.top = (r.top - bounds.top) + 'px';
        });
    }

    function applyGravity(win) {
        const areaRect = area.getBoundingClientRect();
        const winRect = win.getBoundingClientRect();
        let floor = areaRect.bottom;
        document.querySelectorAll('.window:not(.hidden)').forEach(other => {
            if (other === win) return;
            const r = other.getBoundingClientRect();
            const overlap = winRect.left < r.right && winRect.right > r.left;
            if (overlap && r.top >= winRect.top) {
                floor = Math.min(floor, r.top);
            }
        });
        const newTop = floor - areaRect.top - winRect.height;
        win.style.top = newTop + 'px';
    }

    btn.addEventListener('click', () => {
        gravityMode = !gravityMode;
        btn.textContent = gravityMode ? 'Stop gravity' : 'Gravity mode';
        if (gravityMode) {
            convertToAbsolute();
            $(".window").draggable('option', 'stop', function (event, ui) {
                if (gravityMode) applyGravity(event.target);
            });
        } else {
            $(".window").draggable('option', 'stop', null);
        }
    });
});