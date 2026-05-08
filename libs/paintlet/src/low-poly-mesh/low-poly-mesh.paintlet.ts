import { PaintRenderingContext2D, PaintSize } from '../paint.type';
import { registerPaintlet } from '../register-paintlet';

/**
 * Configuration for the Low Poly Mesh Paintlet
 */
interface LowPolyMeshConfig {
  color1: string;
  color2: string;
  cellSize: number;
  jitter: number;
  seed: number;
  strokeWidth: number;
  strokeColor: string;
}

/**
 * Low Poly Mesh Paintlet
 * Renders a triangulated mesh with shaded faces, producing a "crumpled paper"
 * / low-poly art look (like the reference image).
 *
 * The paintlet builds a jittered point grid, splits every cell into two
 * triangles and shades each face by blending `color1` and `color2` based on
 * a deterministic per-vertex height field.
 *
 * Custom Properties:
 * - `--tp-low-poly-color-1`: Base (light) color (default: `#ffffff`)
 * - `--tp-low-poly-color-2`: Shadow color (default: `#a8b4c0`)
 * - `--tp-low-poly-cell-size`: Approximate triangle size in px (default: `60`)
 * - `--tp-low-poly-jitter`: Vertex jitter amount in `[0, 1]` (default: `0.55`)
 * - `--tp-low-poly-seed`: Seed for deterministic randomness (default: `1`)
 * - `--tp-low-poly-stroke-width`: Edge line width in px, `0` to disable (default: `0`)
 * - `--tp-low-poly-stroke-color`: Edge color (default: `rgba(0,0,0,0.08)`)
 *
 * @example
 * ```css
 * .hero {
 *   background-image: --tp-low-poly-mesh();
 *   --tp-low-poly-color-1: #ffffff;
 *   --tp-low-poly-color-2: #9fb1c2;
 *   --tp-low-poly-cell-size: 80;
 * }
 * ```
 */
export class LowPolyMeshPaintlet {
  static PROPERTIES = [
    {
      name: '--tp-low-poly-color-1',
      syntax: '<color>',
      inherits: true,
      initialValue: '#ffffff',
    },
    {
      name: '--tp-low-poly-color-2',
      syntax: '<color>',
      inherits: true,
      initialValue: '#a8b4c0',
    },
    {
      name: '--tp-low-poly-cell-size',
      syntax: '<number>',
      inherits: true,
      initialValue: 60,
    },
    {
      name: '--tp-low-poly-jitter',
      syntax: '<number>',
      inherits: true,
      initialValue: 0.55,
    },
    {
      name: '--tp-low-poly-seed',
      syntax: '<number>',
      inherits: true,
      initialValue: 1,
    },
    {
      name: '--tp-low-poly-stroke-width',
      syntax: '<number>',
      inherits: true,
      initialValue: 0,
    },
    {
      name: '--tp-low-poly-stroke-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(0,0,0,0.08)',
    },
  ];

  static get inputProperties(): string[] {
    return this.PROPERTIES.map((prop) => prop.name);
  }

  #LOW_POLY_DEFAULTS: LowPolyMeshConfig = {
    color1: '#ffffff',
    color2: '#a8b4c0',
    cellSize: 60,
    jitter: 0.55,
    seed: 1,
    strokeWidth: 0,
    strokeColor: 'rgba(0,0,0,0.08)',
  };

  /**
   * Extract configuration from CSS custom properties
   */
  #getConfig(properties: StylePropertyMapReadOnly): LowPolyMeshConfig {
    const d = this.#LOW_POLY_DEFAULTS;
    return {
      color1: properties.get('--tp-low-poly-color-1')?.toString().trim() || d.color1,
      color2: properties.get('--tp-low-poly-color-2')?.toString().trim() || d.color2,
      cellSize: parseFloat(properties.get('--tp-low-poly-cell-size')?.toString() || String(d.cellSize)),
      jitter: parseFloat(properties.get('--tp-low-poly-jitter')?.toString() || String(d.jitter)),
      seed: parseFloat(properties.get('--tp-low-poly-seed')?.toString() || String(d.seed)),
      strokeWidth: parseFloat(properties.get('--tp-low-poly-stroke-width')?.toString() || String(d.strokeWidth)),
      strokeColor: properties.get('--tp-low-poly-stroke-color')?.toString().trim() || d.strokeColor,
    };
  }

  paint(
    ctx: PaintRenderingContext2D,
    { width, height }: PaintSize,
    properties: StylePropertyMapReadOnly
  ): void {
    const { color1, color2, cellSize, jitter, seed, strokeWidth, strokeColor } = this.#getConfig(properties);

    if (width <= 0 || height <= 0) return;

    const safeCell = Math.max(8, cellSize);
    const cols = Math.max(2, Math.ceil(width / safeCell) + 1);
    const rows = Math.max(2, Math.ceil(height / safeCell) + 1);

    const stepX = width / (cols - 1);
    const stepY = height / (rows - 1);
    const clampedJitter = Math.min(1, Math.max(0, jitter));
    const jitterX = stepX * 0.5 * clampedJitter;
    const jitterY = stepY * 0.5 * clampedJitter;

    // Pre-compute jittered vertex positions and per-vertex "height" used for shading.
    const px: number[] = new Array(cols * rows);
    const py: number[] = new Array(cols * rows);
    const ph: number[] = new Array(cols * rows);

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const idx = j * cols + i;
        const isEdge = i === 0 || j === 0 || i === cols - 1 || j === rows - 1;
        const jx = isEdge ? 0 : (this.#hash(i, j, seed) - 0.5) * 2 * jitterX;
        const jy = isEdge ? 0 : (this.#hash(i, j, seed + 17.13) - 0.5) * 2 * jitterY;
        px[idx] = i * stepX + jx;
        py[idx] = j * stepY + jy;
        ph[idx] = this.#hash(i, j, seed + 53.91);
      }
    }

    // Paint a base of color1 so we can blend color2 on top via per-triangle alpha.
    ctx.fillStyle = color1;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = color2;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineJoin = 'round';

    const drawTriangle = (
      ax: number, ay: number,
      bx: number, by: number,
      cx: number, cy: number,
      shade: number
    ) => {
      ctx.globalAlpha = shade;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.lineTo(cx, cy);
      ctx.closePath();
      ctx.fill();
      if (strokeWidth > 0) {
        ctx.globalAlpha = 1;
        ctx.stroke();
      }
    };

    for (let j = 0; j < rows - 1; j++) {
      for (let i = 0; i < cols - 1; i++) {
        const a = j * cols + i;
        const b = j * cols + (i + 1);
        const c = (j + 1) * cols + i;
        const d = (j + 1) * cols + (i + 1);

        // Alternate diagonal direction per cell for a more organic look.
        const flip = ((i + j) & 1) === 0;

        if (flip) {
          drawTriangle(px[a], py[a], px[b], py[b], px[c], py[c], (ph[a] + ph[b] + ph[c]) / 3);
          drawTriangle(px[b], py[b], px[d], py[d], px[c], py[c], (ph[b] + ph[d] + ph[c]) / 3);
        } else {
          drawTriangle(px[a], py[a], px[b], py[b], px[d], py[d], (ph[a] + ph[b] + ph[d]) / 3);
          drawTriangle(px[a], py[a], px[d], py[d], px[c], py[c], (ph[a] + ph[d] + ph[c]) / 3);
        }
      }
    }

    ctx.globalAlpha = 1;
  }

  /**
   * Deterministic 2D hash returning a value in [0, 1).
   * Implemented as a static method so it survives `Function#toString`
   * serialization into the paint worklet.
   */
  #hash(x: number, y: number, seed: number): number {
    const v = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123;
    return v - Math.floor(v);
  }
}

// Auto-register the paintlet when module loads
registerPaintlet('tp-low-poly-mesh', LowPolyMeshPaintlet, LowPolyMeshPaintlet.PROPERTIES);
