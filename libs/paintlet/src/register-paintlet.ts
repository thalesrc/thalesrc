import { CSSPropertyDefinition } from "./paint.type";

/**
 * Register CSS custom properties to make them animatable
 */
function registerCSSProperties(
  name: string,
  properties: CSSPropertyDefinition[],
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
    ${propertyName}: 1000;
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
@function --${name}() {
  result: paint(${name});
}
  `

  styleElement.textContent = propertiesCSS + keyframesCSS + paintFunctionCSS;
  document.head.appendChild(styleElement);
}

/**
 * Helper function to register a paintlet
 */
export function registerPaintlet(
  name: string,
  paintletClass: any,
  cssProperties?: CSSPropertyDefinition[],
  keyframes?: Record<string, string>
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
  if (cssProperties && cssProperties.length > 0) {
    registerCSSProperties(name, cssProperties, keyframes);
  }
}
