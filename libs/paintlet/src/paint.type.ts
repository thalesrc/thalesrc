/**
 * CSS Paint API type definitions
 */
export interface PaintSize {
  width: number;
  height: number;
}

export type PaintRenderingContext2D = CanvasRenderingContext2D;

/**
 * CSS Custom Property Definition
 */
export interface CSSPropertyDefinition {
  name: string;
  syntax: string;
  inherits: boolean;
  initialValue: string | number;
}
