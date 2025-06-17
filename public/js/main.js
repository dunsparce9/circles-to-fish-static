import { initUI, openFailDialog } from './ui.js';
import { initConverter } from './converter.js';
import { initDvd } from './dvd.js';
import { initGravity } from './gravity.js';
import { initTabs } from './win7.js';

document.addEventListener('DOMContentLoaded', () => {
    initUI();
    initTabs();
    initConverter();
    initDvd();
    initGravity();
});
