document.addEventListener('DOMContentLoaded', () => {
    let dvdMode = false;
    const btn = document.getElementById('dvd-mode-btn');
    const area = document.getElementById('window-area');
    const windows = Array.from(document.querySelectorAll('.window'));
    const velocity = new Map();
    let rafId;

    function initVelocities() {
        const bounds = area.getBoundingClientRect();
        windows.forEach(w => {
            // random speed between 1–3px per frame, random direction
            const dx = (Math.random() * 2 + 1) * (Math.random() < 0.5 ? -1 : 1);
            const dy = (Math.random() * 2 + 1) * (Math.random() < 0.5 ? -1 : 1);
            velocity.set(w, { dx, dy });
            // convert to absolute positioning relative to #window-area
            const r = w.getBoundingClientRect(), br = bounds;
            w.style.position = 'absolute';
            w.style.left = (r.left - br.left) + 'px';
            w.style.top = (r.top - br.top) + 'px';
        });
    }

    function animate() {
        const bounds = area.getBoundingClientRect();
        windows.forEach(w => {
            const { dx, dy } = velocity.get(w);
            let x = parseFloat(w.style.left), y = parseFloat(w.style.top);
            const wRect = w.getBoundingClientRect();

            // bounce off edges
            if (x + dx <= 0 || x + wRect.width + dx >= bounds.width) velocity.get(w).dx *= -1;
            if (y + dy <= 0 || y + wRect.height + dy >= bounds.height) velocity.get(w).dy *= -1;

            w.style.left = (x + velocity.get(w).dx) + 'px';
            w.style.top = (y + velocity.get(w).dy) + 'px';
        });
        rafId = requestAnimationFrame(animate);
    }

    btn.addEventListener('click', () => {
        if (!dvdMode) {
            dvdMode = true;
            btn.textContent = 'Stop DVD mode';
            initVelocities();
            animate();
        } else {
            dvdMode = false;
            btn.textContent = 'DVD mode';
            cancelAnimationFrame(rafId);
        }
    });
});
