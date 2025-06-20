export function initGravity() {
    const btn = document.getElementById('gravity-btn');
    if (!btn) return;
    const area = document.getElementById('window-area');
    let gravityMode = false;
    const rafMap = new Map();

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
         const target = floor - areaRect.top - winRect.height;
        let current = parseFloat(win.style.top);
        if (isNaN(current)) current = target;
        let velocity = 0;
        if (rafMap.has(win)) {
            cancelAnimationFrame(rafMap.get(win));
        }
        function step() {
            velocity += 1; // acceleration per frame
            current += velocity;
            if (current >= target) {
                win.style.top = target + 'px';
                rafMap.delete(win);
            } else {
                win.style.top = current + 'px';
                const id = requestAnimationFrame(step);
                rafMap.set(win, id);
            }
        }
        const id = requestAnimationFrame(step);
        rafMap.set(win, id);
    }

    function applyGravityAll() {
        document.querySelectorAll('.window:not(.hidden)').forEach(w => applyGravity(w));
    }

    btn.addEventListener('click', () => {
        gravityMode = !gravityMode;
        btn.textContent = gravityMode ? 'Gravity off' : 'Gravity on';
        if (gravityMode) {
            convertToAbsolute();
            applyGravityAll();
            $(".window").draggable('option', 'stop', function (event, ui) {
                if (gravityMode) applyGravityAll();
            });
        } else {
            $(".window").draggable('option', 'stop', null);
        }
    });
}
