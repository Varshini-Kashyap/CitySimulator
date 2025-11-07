// Jest setup file for additional configuration
import 'jest-canvas-mock';

// Mock canvas for testing
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: jest.fn(() => ({
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    lineCap: 'butt',
    lineJoin: 'miter',
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    fill: jest.fn(),
    fillRect: jest.fn(),
    arc: jest.fn(),
    globalAlpha: 1.0,
    save: jest.fn(),
    restore: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(),
    putImageData: jest.fn(),
    createImageData: jest.fn(),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 })),
    textAlign: 'start',
    textBaseline: 'alphabetic',
    font: '',
    fillText: jest.fn(),
    strokeText: jest.fn(),
    rect: jest.fn(),
    clip: jest.fn(),
    isPointInPath: jest.fn(() => false),
    createLinearGradient: jest.fn(),
    createRadialGradient: jest.fn(),
    createPattern: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn(),
    scale: jest.fn(),
    transform: jest.fn(),
    resetTransform: jest.fn(),
    drawFocusIfNeeded: jest.fn(),
    addHitRegion: jest.fn(),
    removeHitRegion: jest.fn(),
    clearHitRegions: jest.fn(),
    ellipse: jest.fn(),
    bezierCurveTo: jest.fn(),
    quadraticCurveTo: jest.fn(),
    closePath: jest.fn(),
    createConicGradient: jest.fn(),
    roundRect: jest.fn()
  }))
});

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now())
  }
});

