import { PaintRenderingContext2D, PaintSize } from "../paint.type";
import { registerPaintlet } from "../register-paintlet";

/**
 * Configuration for the Check Paintlet
 */
interface CheckConfig {
  cellSize: number;
  cellWidth: number;
  cellHeight: number;
  strokeWidth: number;
  strokeWidthH: number;
  strokeWidthV: number;
  strokeColor: string;
  strokeColorH: string;
  strokeColorV: string;
}

/**
 * Check Paintlet
 * Creates a grid-line pattern with horizontal and vertical lines
 *
 * Custom Properties:
 * - --tha-check-cell-size: Uniform cell size (supports number or percentage, default: 20)
 * - --tha-check-cell-width: Horizontal spacing between vertical lines (auto = inherit cell-size, supports percentage)
 * - --tha-check-cell-height: Vertical spacing between horizontal lines (auto = inherit cell-size, supports percentage)
 * - --tha-check-stroke-width: Uniform stroke width for all lines (default: .5)
 * - --tha-check-stroke-width-h: Stroke width for horizontal lines (auto = inherit stroke-width)
 * - --tha-check-stroke-width-v: Stroke width for vertical lines (auto = inherit stroke-width)
 * - --tha-check-stroke-color: Uniform stroke color for all lines (default: #333333)
 * - --tha-check-stroke-color-h: Color for horizontal lines (auto = inherit stroke-color)
 * - --tha-check-stroke-color-v: Color for vertical lines (auto = inherit stroke-color)
 *
 * @example
 * ```css
 * .element {
 *   background-image: paint(tha-check);
 *   --tha-check-cell-size: 20;
 *   --tha-check-stroke-color: #333333;
 * }
 * ```
 *
 * @example
 * ```css
 * .element {
 *   background-image: paint(tha-check);
 *   --tha-check-cell-width: 40;
 *   --tha-check-cell-height: 20;
 *   --tha-check-stroke-color-h: #e74c3c;
 *   --tha-check-stroke-color-v: #3498db;
 * }
 * ```
 */
export class CheckPaintlet {
  static PROPERTIES = [
    {
      name: '--tha-check-cell-size',
      syntax: '<number> | <percentage>',
      inherits: true,
      initialValue: '20',
    },
    {
      name: '--tha-check-cell-width',
      syntax: '<number> | <percentage> | auto',
      inherits: true,
      initialValue: 'auto',
    },
    {
      name: '--tha-check-cell-height',
      syntax: '<number> | <percentage> | auto',
      inherits: true,
      initialValue: 'auto',
    },
    {
      name: '--tha-check-stroke-width',
      syntax: '<number>',
      inherits: true,
      initialValue: '.5',
    },
    {
      name: '--tha-check-stroke-width-h',
      syntax: '<number> | auto',
      inherits: true,
      initialValue: 'auto',
    },
    {
      name: '--tha-check-stroke-width-v',
      syntax: '<number> | auto',
      inherits: true,
      initialValue: 'auto',
    },
    {
      name: '--tha-check-stroke-color',
      syntax: '<color>',
      inherits: true,
      initialValue: '#333333',
    },
    {
      name: '--tha-check-stroke-color-h',
      syntax: '<color> | auto',
      inherits: true,
      initialValue: 'auto',
    },
    {
      name: '--tha-check-stroke-color-v',
      syntax: '<color> | auto',
      inherits: true,
      initialValue: 'auto',
    },
  ];

  static get inputProperties(): string[] {
    return this.PROPERTIES.map((prop) => prop.name);
  }

  static get inputArguments(): string[] {
    return [];
  }

  static get contextOptions() { return {alpha: true}; }

  #getConfig(properties: StylePropertyMapReadOnly, geom: PaintSize): CheckConfig {
    const cellSize = properties.get('--tha-check-cell-size') as CSSUnitValue;
    const strokeWidth = properties.get('--tha-check-stroke-width') as CSSUnitValue;
    const strokeColor = properties.get('--tha-check-stroke-color')?.toString() ?? '#333333';

    const cellWidth = properties.get('--tha-check-cell-width');
    const cellHeight = properties.get('--tha-check-cell-height');
    const strokeWidthH = properties.get('--tha-check-stroke-width-h');
    const strokeWidthV = properties.get('--tha-check-stroke-width-v');
    const strokeColorH = properties.get('--tha-check-stroke-color-h');
    const strokeColorV = properties.get('--tha-check-stroke-color-v');

    return {
      get cellSize() {
        if (cellSize.unit === 'percentage') {
          return (cellSize.value / 100) * Math.min(geom.width, geom.height);
        }

        return cellSize.value;
      },
      get cellWidth() {
        if (cellWidth instanceof CSSKeywordValue && cellWidth.value === 'auto') {
          return this.cellSize;
        }

        if ((cellWidth as CSSUnitValue).unit === 'percentage') {
          return ((cellWidth as CSSUnitValue).value / 100) * geom.width;
        }

        return (cellWidth as CSSUnitValue).value;
      },
      get cellHeight() {
        if (cellHeight instanceof CSSKeywordValue && cellHeight.value === 'auto') {
          return this.cellSize;
        }

        if ((cellHeight as CSSUnitValue).unit === 'percentage') {
          return ((cellHeight as CSSUnitValue).value / 100) * geom.height;
        }
        return (cellHeight as CSSUnitValue).value;
      },
      strokeWidth: strokeWidth.value,
      get strokeWidthH() {
        if (strokeWidthH instanceof CSSKeywordValue && strokeWidthH.value === 'auto') {
          return this.strokeWidth;
        }

        return (strokeWidthH as CSSUnitValue).value;
      },
      get strokeWidthV() {
        if (strokeWidthV instanceof CSSKeywordValue && strokeWidthV.value === 'auto') {
          return this.strokeWidth;
        }
        return (strokeWidthV as CSSUnitValue).value;
      },
      strokeColor: strokeColor,
      get strokeColorH() {
        if (strokeColorH instanceof CSSKeywordValue && strokeColorH.value === 'auto') {
          return this.strokeColor;
        }
        return strokeColorH?.toString() ?? this.strokeColor;
      },
      get strokeColorV() {
        if (strokeColorV instanceof CSSKeywordValue && strokeColorV.value === 'auto') {
          return this.strokeColor;
        }
        return strokeColorV?.toString() ?? this.strokeColor;
      }
    };
  }

  /**
   * Draw horizontal lines across the canvas
   */
  #drawHorizontalLines(
    ctx: PaintRenderingContext2D,
    { width, height }: PaintSize,
    config: CheckConfig
  ): void {
    ctx.strokeStyle = config.strokeColorH;
    ctx.lineWidth = config.strokeWidthH;
    ctx.beginPath();

    for (let y = config.cellHeight; y < height; y += config.cellHeight) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }

    ctx.stroke();
  }

  /**
   * Draw vertical lines across the canvas
   */
  #drawVerticalLines(
    ctx: PaintRenderingContext2D,
    { width, height }: PaintSize,
    config: CheckConfig
  ): void {
    ctx.strokeStyle = config.strokeColorV;
    ctx.lineWidth = config.strokeWidthV;
    ctx.beginPath();

    for (let x = config.cellWidth; x < width; x += config.cellWidth) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }

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
    const config = this.#getConfig(properties, geom);

    this.#drawHorizontalLines(ctx, geom, config);
    this.#drawVerticalLines(ctx, geom, config);
  }
}

// Auto-register the paintlet when module loads
registerPaintlet('tha-check', CheckPaintlet, CheckPaintlet.PROPERTIES);
