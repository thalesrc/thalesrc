import { CSSPropertyDefinition, PaintRenderingContext2D, PaintSize } from '../paint.type';
import { registerPaintlet } from '../register-paintlet';

/**
 * Configuration for the Ellipse Gradient Paintlet
 */
interface EllipseGradientConfig {
  startColor: string;
  endColor: string;
  stretch: number;
  angle: number;
}

/**
 * Ellipse Gradient Paintlet
 * Creates a single elliptical radial gradient, stretched in a given direction
 *
 * Custom Properties:
 * - --tp-ellipse-gradient-start-color: Center color (default: #000000)
 * - --tp-ellipse-gradient-end-color: Edge color (default: transparent)
 * - --tp-ellipse-gradient-stretch: Stretch factor, 1 = circle, >1 = elongated (default: 1.6)
 * - --tp-ellipse-gradient-angle: Stretch direction as CSS angle (default: 0deg)
 *
 * @example
 * ```css
 * .element {
 *   background-image: paint(tp-ellipse-gradient);
 *   --tp-ellipse-gradient-start-color: #000000;
 *   --tp-ellipse-gradient-end-color: transparent;
 *   --tp-ellipse-gradient-stretch: 2;
 *   --tp-ellipse-gradient-angle: 45deg;
 * }
 * ```
 */
export class EllipseGradientPaintlet {
  static readonly DEFAULTS: EllipseGradientConfig = {
    startColor: '#000000',
    endColor: 'transparent',
    stretch: 1.6,
    angle: 0,
  };

  static readonly PROPERTIES: CSSPropertyDefinition[] = [
    {
      name: '--tp-ellipse-gradient-start-color',
      syntax: '<color>',
      inherits: true,
      initialValue: EllipseGradientPaintlet.DEFAULTS.startColor,
    },
    {
      name: '--tp-ellipse-gradient-end-color',
      syntax: '<color>',
      inherits: true,
      initialValue: EllipseGradientPaintlet.DEFAULTS.endColor,
    },
    {
      name: '--tp-ellipse-gradient-stretch',
      syntax: '<number>',
      inherits: true,
      initialValue: EllipseGradientPaintlet.DEFAULTS.stretch,
    },
    {
      name: '--tp-ellipse-gradient-angle',
      syntax: '<angle>',
      inherits: true,
      initialValue: '0deg',
    },
  ];

  static get inputProperties(): string[] {
    return this.PROPERTIES.map(prop => prop.name);
  }

  static get contextOptions() { return { alpha: true }; }

  /**
   * Convert a CSSUnitValue angle to radians
   */
  #toRadians(value: CSSUnitValue): number {
    switch (value.unit) {
      case 'deg': return value.value * Math.PI / 180;
      case 'grad': return value.value * Math.PI / 200;
      case 'turn': return value.value * Math.PI * 2;
      case 'rad':
      default: return value.value;
    }
  }

  #getConfig(properties: StylePropertyMapReadOnly): EllipseGradientConfig {
    const angle = properties.get('--tp-ellipse-gradient-angle') as CSSUnitValue;

    return {
      startColor: properties.get('--tp-ellipse-gradient-start-color')?.toString() || EllipseGradientPaintlet.DEFAULTS.startColor,
      endColor: properties.get('--tp-ellipse-gradient-end-color')?.toString() || EllipseGradientPaintlet.DEFAULTS.endColor,
      stretch: parseFloat(properties.get('--tp-ellipse-gradient-stretch')?.toString() || String(EllipseGradientPaintlet.DEFAULTS.stretch)),
      angle: this.#toRadians(angle),
    };
  }

  paint(
    ctx: PaintRenderingContext2D,
    geom: PaintSize,
    properties: StylePropertyMapReadOnly,
  ): void {
    const { startColor, endColor, stretch, angle } = this.#getConfig(properties);

    const cx = geom.width / 2;
    const cy = geom.height / 2;
    const radius = Math.max(geom.width, geom.height) / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.scale(1, stretch);

    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    gradient.addColorStop(0, startColor);
    gradient.addColorStop(1, endColor);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

registerPaintlet('tp-ellipse-gradient', EllipseGradientPaintlet, EllipseGradientPaintlet.PROPERTIES);
