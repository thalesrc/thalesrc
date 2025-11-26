import { CSSPropertyDefinition } from "./paint.type";

interface ArgDefinition {
  name: string;
  syntax: string;
  default: string;
}

/**
 * Register CSS custom properties to make them animatable
 */
function registerCSSProperties(
  name: string,
  properties: CSSPropertyDefinition[],
  args: ArgDefinition[],
  keyframes?: Record<string, string>
): void {
  if (typeof document === 'undefined') return;

  const styleElement = document.createElement('style');

  // Generate @property definitions
  const propertiesCSS = properties
    .map(
      prop => `
@property ${prop.name} {
  syntax: "${prop.syntax}";
  inherits: ${prop.inherits};
  initial-value: ${prop.initialValue};
}
`
    )
    .join('');

  // Generate @keyframes definitions
  const keyframesCSS = keyframes
    ? Object.entries(keyframes)
        .map(
          ([animationName, propertyName]) => `
@keyframes ${animationName} {
  from {
    ${propertyName}: 0;
  }
  to {
    ${propertyName}: 100;
  }
}
@function --${animationName}(--seconds <time>) {
  result: ${animationName} var(--seconds, 1s) linear infinite;
}
`
        )
        .join('')
    : '';
  const paintFunctionCSS = `
@function --${name}(${args.map(arg => `--${arg.name} type(${arg.syntax}): ${arg.default}`).join(', ')}) returns <image> {
  result: paint(${name}${args.length > 0 ? `, ${args.map(arg => `var(--${arg.name}, ${arg.default})`).join(', ')}` : ''});
}
  `

  const allContent = propertiesCSS + keyframesCSS + paintFunctionCSS;
  if (!allContent.trim()) return;

  styleElement.textContent = allContent;
  document.head.appendChild(styleElement);
}

/**
 * Helper function to register a paintlet
 */
export function registerPaintlet(
  name: string,
  paintletClass: any,
  cssProperties: CSSPropertyDefinition[],
  args: ArgDefinition[] = [],
  keyframes: Record<string, string> = {}
): void {
  if (typeof CSS === 'undefined' || !(CSS as any).paintWorklet) {
    console.warn(`CSS Paint API is not supported in this browser. Paintlet "${name}" will not be registered.`);
    return;
  }

  const paintletCode = `
    ${paintletClass.toString()}
    registerPaint('${name}', ${paintletClass.name});
  `;

  const blob = new Blob([paintletCode], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);

  (CSS as any).paintWorklet.addModule(url);

  // Register CSS custom properties and keyframes for animation support
  registerCSSProperties(name, cssProperties, args, keyframes);
}
