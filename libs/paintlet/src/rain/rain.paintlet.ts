import { CSSPropertyDefinition, PaintRenderingContext2D, PaintSize } from '../paint.type';
import { registerPaintlet } from '../register-paintlet';

/**
 * Represents a single raindrop
 */
interface Raindrop {
  x: number;
  y: number;
  length: number;
  thickness: number;
  opacity: number;
}

/**
 * Configuration for the Rain Paintlet
 */
interface RainConfig {
  color: string;
  density: number;
  angle: number;
  minLength: number;
  maxLength: number;
  minThickness: number;
  maxThickness: number;
  frame: number;
}

/**
 * Rain Paintlet
 * Creates animated rain effect with customizable properties
 *
 * Custom Properties:
 * - --tha-rain-color: Color of the raindrops (default: #4a90e2)
 * - --tha-rain-density: Number of raindrops (default: 50)
 * - --tha-rain-angle: Angle of rain in degrees, 90 is vertical (default: 75)
 * - --tha-rain-min-length: Minimum length of raindrops in pixels (default: 10)
 * - --tha-rain-max-length: Maximum length of raindrops in pixels (default: 30)
 * - --tha-rain-min-thickness: Minimum thickness of raindrops (default: 1)
 * - --tha-rain-max-thickness: Maximum thickness of raindrops (default: 2)
 * - --tha-rain-frame: Animation frame from 0 to 1000 (default: 0)
 *
 * @example
 * ```css
 * .rain-effect {
 *   background-image: paint(rain);
 *   --tha-rain-color: #4a90e2;
 *   --tha-rain-density: 50;
 *   --tha-rain-angle: 75;
 *   --tha-rain-frame: 0;
 *   animation: tha-rain-animation 2s linear infinite;
 * }
 * ```
 */
export class RainPaintlet {
  static PROPERTIES: CSSPropertyDefinition[] = [
    {
      name: '--tha-rain-color',
      syntax: '<color>',
      inherits: true,
      initialValue: '#4a90e2',
    },
    {
      name: '--tha-rain-density',
      syntax: '<number>',
      inherits: true,
      initialValue: 50,
    },
    {
      name: '--tha-rain-angle',
      syntax: '<number>',
      inherits: true,
      initialValue: 75,
    },
    {
      name: '--tha-rain-min-length',
      syntax: '<number>',
      inherits: true,
      initialValue: 10,
    },
    {
      name: '--tha-rain-max-length',
      syntax: '<number>',
      inherits: true,
      initialValue: 30,
    },
    {
      name: '--tha-rain-min-thickness',
      syntax: '<number>',
      inherits: true,
      initialValue: 1,
    },
    {
      name: '--tha-rain-max-thickness',
      syntax: '<number>',
      inherits: true,
      initialValue: 2,
    },
    {
      name: '--tha-rain-frame',
      syntax: '<number>',
      inherits: true,
      initialValue: 0,
    },
  ];

  /**
   * Default configuration values
   */
  static RAIN_DEFAULTS: RainConfig = {
    color: '#4a90e2',
    density: 50,
    angle: 75,
    minLength: 10,
    maxLength: 30,
    minThickness: 1,
    maxThickness: 2,
    frame: 0,
  };

  static get inputProperties(): string[] {
    return RainPaintlet.PROPERTIES.map(prop => prop.name);
  }

  /**
   * Extract configuration from CSS custom properties
   */
  #getConfig(properties: StylePropertyMapReadOnly): RainConfig {
    return {
      color: properties.get('--tha-rain-color')?.toString() || RainPaintlet.RAIN_DEFAULTS.color,
      density: parseFloat(properties.get('--tha-rain-density')?.toString() || String(RainPaintlet.RAIN_DEFAULTS.density)),
      angle: parseFloat(properties.get('--tha-rain-angle')?.toString() || String(RainPaintlet.RAIN_DEFAULTS.angle)),
      minLength: parseFloat(properties.get('--tha-rain-min-length')?.toString() || String(RainPaintlet.RAIN_DEFAULTS.minLength)),
      maxLength: parseFloat(properties.get('--tha-rain-max-length')?.toString() || String(RainPaintlet.RAIN_DEFAULTS.maxLength)),
      minThickness: parseFloat(properties.get('--tha-rain-min-thickness')?.toString() || String(RainPaintlet.RAIN_DEFAULTS.minThickness)),
      maxThickness: parseFloat(properties.get('--tha-rain-max-thickness')?.toString() || String(RainPaintlet.RAIN_DEFAULTS.maxThickness)),
      frame: parseFloat(properties.get('--tha-rain-frame')?.toString() || String(RainPaintlet.RAIN_DEFAULTS.frame)),
    };
  }

  /**
   * Seeded random number generator for consistent raindrop positions
   */
  #seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  /**
   * Generate raindrops based on configuration and frame
   */
  #generateRaindrops(config: RainConfig, geom: PaintSize): Raindrop[] {
    const raindrops: Raindrop[] = [];
    const maxDimension = Math.max(geom.width, geom.height);

    // Calculate buffer zone based on angle to ensure full coverage
    const angleRad = (config.angle * Math.PI) / 180;
    const bufferX = Math.abs(Math.cos(angleRad - Math.PI / 2)) * maxDimension;
    const bufferY = Math.abs(Math.sin(angleRad - Math.PI / 2)) * maxDimension;

    // Normalize frame from 0-1000 to 0-100 for movement calculations
    const normalizedFrame = config.frame / 10;

    for (let i = 0; i < config.density; i++) {
      const seed = i * 12345;

      // Use seeded random for consistent positions with buffer zones
      const baseX = this.#seededRandom(seed) * (geom.width + bufferX * 2) - bufferX;
      const baseY = this.#seededRandom(seed + 1) * (geom.height + bufferY * 2) - bufferY;

      // Calculate total movement distance for one full cycle
      const wrapWidth = geom.width + bufferX * 2;
      const wrapHeight = geom.height + bufferY * 2;

      // Calculate movement based on normalized frame
      // Use modulo to ensure smooth cycling between frame 0 and 1000
      // Fixed speed multiplier of 5 for consistent animation
      const moveX = Math.cos(angleRad - Math.PI / 2) * 5 * normalizedFrame;
      const moveY = Math.sin(angleRad - Math.PI / 2) * 5 * normalizedFrame;

      // Apply movement with wrapping - modulo ensures seamless loop
      let x = (baseX + moveX + bufferX) % wrapWidth - bufferX;
      let y = (baseY + moveY + bufferY) % wrapHeight - bufferY;

      // Ensure positive modulo (JavaScript modulo can be negative)
      if (x < -bufferX) x += wrapWidth;
      if (y < -bufferY) y += wrapHeight;

      const length = config.minLength + this.#seededRandom(seed + 2) * (config.maxLength - config.minLength);
      const thickness = config.minThickness + this.#seededRandom(seed + 3) * (config.maxThickness - config.minThickness);
      const opacity = 0.3 + this.#seededRandom(seed + 4) * 0.7;

      raindrops.push({
        x,
        y,
        length,
        thickness,
        opacity,
      });
    }

    return raindrops;
  }

  /**
   * Draw a single raindrop
   */
  #drawRaindrop(
    ctx: PaintRenderingContext2D,
    drop: Raindrop,
    angle: number,
    color: string
  ): void {
    const angleRad = (angle * Math.PI) / 180;
    const endX = drop.x + Math.cos(angleRad - Math.PI / 2) * drop.length;
    const endY = drop.y + Math.sin(angleRad - Math.PI / 2) * drop.length;

    ctx.strokeStyle = `rgb(from ${color} r g b / ${drop.opacity})`;
    ctx.lineWidth = drop.thickness;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(drop.x, drop.y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }

  /**
   * Main paint method called by CSS Paint API
   */
  paint(
    ctx: PaintRenderingContext2D,
    geom: PaintSize,
    properties: StylePropertyMapReadOnly
  ): void {
    const config = this.#getConfig(properties);
    const raindrops = this.#generateRaindrops(config, geom);

    // Draw all raindrops
    raindrops.forEach(drop => {
      this.#drawRaindrop(ctx, drop, config.angle, config.color);
    });
  }
}

// Auto-register the paintlet when module loads
registerPaintlet('tha-rain', RainPaintlet, RainPaintlet.PROPERTIES, {
  'tha-rain-animation': '--tha-rain-frame',
});
