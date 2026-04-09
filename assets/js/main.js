import './utils/mask.js';
import './utils/scroll.js';
import './modules/animations.js';
import './modules/form.js';
import { initGenericCarousel } from './modules/carousel-v2.js';

import { initOfficeCarousel } from './modules/office-slider.js';


// Initialize modules
document.addEventListener('DOMContentLoaded', () => {
    initOfficeCarousel();
    
    // Initialize Media Carousel
    initGenericCarousel({
        trackId: 'mediaTrack',
        prevId: 'mediaPrev',
        nextId: 'mediaNext',
        dotsId: 'mediaDots',
        autoplaySpeed: 5000
    });
});

