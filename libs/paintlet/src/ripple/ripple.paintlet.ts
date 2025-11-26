import { PaintRenderingContext2D, PaintSize } from "../paint.type";
import { registerPaintlet } from "../register-paintlet";

/**
 * Configuration for the Ripple Paintlet
 */
interface RippleConfig {
  color: string;
  density: number;
  waveWidth: number;
}

/**
 * Ripple Paintlet
 * Creates concentric circular waves radiating from the center
 *
 * Custom Properties:
 * - --tha-ripple-color: Color of the ripple waves (default: #3498db)
 * - --tha-ripple-density: Number of ripple waves (default: 5)
 * - --tha-ripple-wave-width: Width of each wave line in pixels (default: 2)
 *
 * @example
 * ```css
 * .element {
 *   background-image: paint(ripple);
 *   --tha-ripple-color: #3498db;
 *   --tha-ripple-density: 5;
 *   --tha-ripple-wave-width: 2;
 * }
 * ```
 */
export class RipplePaintlet {
  static PROPERTIES = [
    {
      name: '--tha-ripple-color',
      syntax: '<color>',
      inherits: true,
      initialValue: '#3498db',
    },
    {
      name: '--tha-ripple-density',
      syntax: '<number>',
      inherits: true,
      initialValue: 5,
    },
    {
      name: '--tha-ripple-wave-width',
      syntax: '<number>',
      inherits: true,
      initialValue: 2,
    },
  ];

  /**
   * Default configuration values
   */
  static RIPPLE_DEFAULTS: RippleConfig = {
    color: '#3498db',
    density: 5,
    waveWidth: 2,
  };

  static get inputProperties(): string[] {
    return this.PROPERTIES.map((prop) => prop.name);
  }

  /**
   * Extract configuration from CSS custom properties
   */
  #getConfig(properties: StylePropertyMapReadOnly): RippleConfig {
    return {
      color: properties.get('--tha-ripple-color')?.toString() || RipplePaintlet.RIPPLE_DEFAULTS.color,
      density: parseFloat(properties.get('--tha-ripple-density')?.toString() || String(RipplePaintlet.RIPPLE_DEFAULTS.density)),
      waveWidth: parseFloat(properties.get('--tha-ripple-wave-width')?.toString() || String(RipplePaintlet.RIPPLE_DEFAULTS.waveWidth)),
    };
  }

  /**
   * Draw a single ripple circle
   */
  #drawRipple(
    ctx: PaintRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number
  ): void {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  /**
   * Main paint method called by CSS Paint API
   */
  paint(
    ctx: PaintRenderingContext2D,
    {width, height}: PaintSize,
    properties: StylePropertyMapReadOnly
  ): void {
    const {color, density, waveWidth} = this.#getConfig(properties);

    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.max(width, height);
    const radiusStep = maxRadius / density;

    // Set up drawing style
    ctx.strokeStyle = color;
    ctx.lineWidth = waveWidth;
    // Draw ripples from center outward
    for (let i = 1; i <= density; i++) {
      const radius = radiusStep * i;
      this.#drawRipple(ctx, centerX, centerY, radius);
    }
  }
}

// Auto-register the paintlet when module loads
registerPaintlet('tha-ripple', RipplePaintlet, RipplePaintlet.PROPERTIES);
