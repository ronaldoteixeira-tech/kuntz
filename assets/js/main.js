import './utils/mask.js';
import './utils/scroll.js';
import './modules/animations.js';
import './modules/form.js';
import './modules/carousel.js';
import { initOfficeCarousel } from './modules/office-slider.js';

// Initialize modules
document.addEventListener('DOMContentLoaded', () => {
    initOfficeCarousel();
});
