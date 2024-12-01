import { useState } from "react";

export function useConstant<T>(value: T | (() => T)): T {
  const [permanentValue] = useState(value);

  return permanentValue;
}
