import { CSSPropertyDefinition, PaintRenderingContext2D, PaintSize } from '../paint.type';
import { registerPaintlet } from '../register-paintlet';

/**
 * Represents a mesh point with color and position
 */
interface MeshPoint {
  x: number;
  y: number;
  color: string;
}

/**
 * Configuration for the Mesh Gradient Paintlet
 */
interface MeshGradientConfig {
  colors: string[];
  complexity: number;
  seed: number;
  compositePoints: GlobalCompositeOperation;
  compositeLines: GlobalCompositeOperation;
  frame: number;
}

/**
 * Mesh Gradient Paintlet
 * Creates organic, flowing gradient meshes with multiple colors using a three-layer approach:
 * 1. Conic gradient base with all colors distributed evenly
 * 2. Radial gradients at animated mesh points with sizes based on complexity
 * 3. Linear gradients connecting adjacent mesh points
 *
 * Custom Properties:
 * - --tha-mesh-gradient-complexity: Number of mesh points (default: 5, affects circle sizes inversely)
 * - --tha-mesh-gradient-seed: Random seed for mesh generation (default: 0)
 * - --tha-mesh-gradient-composite-base: Blend mode for base layer (default: difference)
 * - --tha-mesh-gradient-composite-points: Blend mode for mesh points (default: screen)
 * - --tha-mesh-gradient-composite-lines: Blend mode for connecting lines (default: lighter)
 * - --tha-mesh-gradient-frame: Animation frame from 0 to 100 for circular motion (default: 0)
 *
 * @example
 * ```css
 * .element {
 *   --tha-mesh-gradient-complexity: 7;
 *   --tha-mesh-gradient-seed: 42;
 *   --tha-mesh-gradient-composite-lines: difference;
 *   background-image: --tha-mesh-gradient(#667eea, #764ba2, #f093fb, #4facfe);
 *   animation: --tha-mesh-gradient-animation(10s);
 * }
 * ```
 */
export class MeshGradientPaintlet {
  static readonly SUPPORTED_COLOR_COUNT = 10;

  static readonly MESH_GRADIENT_DEFAULTS: MeshGradientConfig = {
    colors: ['#667eea', '#764ba2', '#f093fb', '#4facfe'],
    complexity: 5,
    seed: 0,
    compositePoints: 'screen',
    compositeLines: 'lighter',
    frame: 0,
  };

  static readonly PROPERTIES: CSSPropertyDefinition[] = [
    {
      name: '--tha-mesh-gradient-complexity',
      syntax: '<number>',
      inherits: true,
      initialValue: MeshGradientPaintlet.MESH_GRADIENT_DEFAULTS.complexity,
    },
    {
      name: '--tha-mesh-gradient-seed',
      syntax: '<number>',
      inherits: true,
      initialValue: MeshGradientPaintlet.MESH_GRADIENT_DEFAULTS.seed,
    },
    {
      name: '--tha-mesh-gradient-composite-points',
      syntax: '<mix-blend-mode>',
      inherits: true,
      initialValue: MeshGradientPaintlet.MESH_GRADIENT_DEFAULTS.compositePoints,
    },
    {
      name: '--tha-mesh-gradient-composite-lines',
      syntax: '<mix-blend-mode>',
      inherits: true,
      initialValue: MeshGradientPaintlet.MESH_GRADIENT_DEFAULTS.compositeLines,
    },
    ...Array.from({ length: MeshGradientPaintlet.SUPPORTED_COLOR_COUNT }, (_, i) => ({
      name: `--tha-mesh-gradient-color-${i + 1}`,
      syntax: 'none | <color>',
      inherits: true,
      initialValue: 'none',
    })),
    {
      name: '--tha-mesh-gradient-frame',
      syntax: '<number>',
      inherits: true,
      initialValue: MeshGradientPaintlet.MESH_GRADIENT_DEFAULTS.frame,
    },
  ];

  static get inputProperties(): string[] {
    return this.PROPERTIES.map((prop) => prop.name);
  }

  static get inputArguments(): string[] {
    return Array.from({ length: MeshGradientPaintlet.SUPPORTED_COLOR_COUNT }, () => 'none | <color>');
  }

  static get contextOptions() { return {alpha: true}; }

  /**
   * Extract configuration from CSS custom properties
   */
  #getConfig(properties: StylePropertyMapReadOnly, args: CSSStyleValue[]): MeshGradientConfig {
    const propColors = Array.from({ length: MeshGradientPaintlet.SUPPORTED_COLOR_COUNT }, (_, i) =>
      properties.get(`--tha-mesh-gradient-color-${i + 1}`)?.toString() || 'none'
    );

    const colors = propColors.map((color, index) =>
      color !== 'none' ? color : args[index]?.toString() || 'none'
    ).filter(color => color !== 'none');

    return {
      colors: colors.length > 0 ? colors : MeshGradientPaintlet.MESH_GRADIENT_DEFAULTS.colors,
      complexity: parseFloat(
        properties.get('--tha-mesh-gradient-complexity')?.toString() ||
        String(MeshGradientPaintlet.MESH_GRADIENT_DEFAULTS.complexity)
      ),
      seed: parseFloat(
        properties.get('--tha-mesh-gradient-seed')?.toString() ||
        String(MeshGradientPaintlet.MESH_GRADIENT_DEFAULTS.seed)
      ),
      compositePoints: properties.get('--tha-mesh-gradient-composite-points')?.toString() as GlobalCompositeOperation ?? MeshGradientPaintlet.MESH_GRADIENT_DEFAULTS.compositePoints,
      compositeLines: properties.get('--tha-mesh-gradient-composite-lines')?.toString() as GlobalCompositeOperation ?? MeshGradientPaintlet.MESH_GRADIENT_DEFAULTS.compositeLines,
      frame: parseFloat(
        properties.get('--tha-mesh-gradient-frame')?.toString() ||
        String(MeshGradientPaintlet.MESH_GRADIENT_DEFAULTS.frame)
      ),
    };
  }

  /**
   * Seeded random number generator
   */
  #seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  /**
   * Generate mesh points with colors ensuring all colors are used
   * Each point moves in a circular path for smooth looping animation
   */
  #generateMeshPoints(config: MeshGradientConfig, geom: PaintSize): MeshPoint[] {
    const points: MeshPoint[] = [];
    const { colors, complexity, seed, frame } = config;

    // Normalize frame from 0-100 to 0-1 for smooth circular motion
    const normalizedFrame = frame / 100;

    for (let i = 0; i < complexity; i++) {
      const seedBase = seed + i * 123;
      const baseX = this.#seededRandom(seedBase) * geom.width;
      const baseY = this.#seededRandom(seedBase + 1) * geom.height;

      // Create organic circular motion for each point
      const radius = Math.min(geom.width, geom.height) * 0.15 * this.#seededRandom(seedBase + 5);
      const startAngle = this.#seededRandom(seedBase + 6) * Math.PI * 2;
      const angle = startAngle + (normalizedFrame * Math.PI * 2);

      const x = baseX + Math.cos(angle) * radius;
      const y = baseY + Math.sin(angle) * radius;

      // Cycle through colors to ensure all are used
      // First pass: assign colors in order
      // Second pass: start over from beginning
      const color = colors[i % colors.length];

      points.push({
        x,
        y,
        color,
      });
    }

    return points;
  }

  /**
   * Main paint method called by CSS Paint API
   */
  paint(
    ctx: PaintRenderingContext2D,
    geom: PaintSize,
    properties: StylePropertyMapReadOnly,
    args: CSSStyleValue[]
  ): void {
    const config = this.#getConfig(properties, args);
    const meshPoints = this.#generateMeshPoints(config, geom);

    if (meshPoints.length === 0) return;

    // Layer 1: Create conic gradient base with all colors distributed evenly
    // This provides a colorful background that all colors blend from
    const conicGradient = ctx.createConicGradient((Math.abs(50 - 50) * 0.36 / 16) + 135, geom.width, geom.height);

    // Distribute colors evenly around the 360-degree circle (only using first quarter for subtlety)
    const colorCount = config.colors.length;
    for (let i = 0; i < colorCount; i++) {
      const stop = i / colorCount / 4;
      conicGradient.addColorStop(stop, `color-mix(in oklab, white 50%, rgb(from ${config.colors[i]} r g b / .5))`);
    }
    // Add first color at the end to complete the circle
    conicGradient.addColorStop(1 / 4, `color-mix(in oklab, white 50%, rgb(from ${config.colors[0]} r g b / .5))`);

    ctx.fillStyle = conicGradient;
    // ctx.imageSmoothingEnabled = true;
    ctx.fillRect(0, 0, geom.width, geom.height);

    // Apply radial glow from corner using difference blend mode for depth
    const maxDim = Math.max(geom.width, geom.height);
    const radGrad = ctx.createRadialGradient(geom.width, geom.height, 0, 0, 0, maxDim);
    radGrad.addColorStop(0, `rgba(255, 255, 255, 0.2)`);
    radGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.arc(geom.width, geom.height, maxDim, 0, Math.PI * 2);
    ctx.fill();

    // Layer 2: Draw radial gradients at mesh points (sorted by size, biggest first)
    ctx.globalCompositeOperation = config.compositePoints;

    // Calculate complexity factor: higher complexity = smaller circles (reduces by 10% per point above 3)
    const complexityFactor = Math.max(0.3, 1 - (config.complexity - 3) * 0.1);
    const maxRadius = Math.min(geom.width, geom.height) * 1 * complexityFactor;
    const minRadius = Math.min(geom.width, geom.height) * 0.1 * complexityFactor;

    // Create array of circles with randomized sizes for organic appearance
    const circles = meshPoints.map((point, i) => {
      const randomFactor = this.#seededRandom(config.seed + i * 456);
      const circleRadius = minRadius + (maxRadius - minRadius) * randomFactor * 16;
      return { point, radius: circleRadius };
    });

    // Sort circles by radius in descending order (biggest first)
    circles.sort((a, b) => b.radius - a.radius);

    // Draw circles from biggest to smallest
    for (const [index, { point, radius }] of Object.entries(circles)) {
      const gradient = ctx.createRadialGradient(
        point.x,
        point.y,
        0,
        point.x,
        point.y,
        radius
      );

      gradient.addColorStop(0, `color-mix(in oklab, white 50%, ${point.color} 50%)`);
      gradient.addColorStop(0.3, `rgb(from ${point.color} r g b / .5)`);
      gradient.addColorStop(1, `transparent`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();

    }

    // Layer 3: Draw linear gradients connecting adjacent mesh points
    // Creates smooth color transitions and ties the mesh together
    ctx.globalCompositeOperation = config.compositeLines;

    // Connect each point to the next, wrapping back to the first
    for (let i = 0; i < meshPoints.length; i++) {
      const point1 = meshPoints[i];
      const point2 = meshPoints[(i + 1) % meshPoints.length];

      const gradient = ctx.createLinearGradient(
        point1.x,
        point1.y,
        point2.x,
        point2.y
      );

      gradient.addColorStop(0, point1.color);
      gradient.addColorStop(1, point2.color);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, geom.width * 2, geom.height * 2);
    }
  }
}

// Auto-register the paintlet when module loads
registerPaintlet(
  'tha-mesh-gradient',
  MeshGradientPaintlet,
  MeshGradientPaintlet.PROPERTIES,
  Array.from({ length: MeshGradientPaintlet.SUPPORTED_COLOR_COUNT }, (_, i) => ({
    name: `color-${i + 1}`,
    syntax: 'none | <color>',
    default: 'var(--tha-mesh-gradient-color-' + (i + 1) + ', none)',
  })),
  {
    'tha-mesh-gradient-animation': '--tha-mesh-gradient-frame',
  }
);
