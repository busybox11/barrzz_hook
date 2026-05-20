export function getReactInstance(element: Element) {
  // Find the internal key assigned by React
  const key = Object.keys(element).find(
    (k) => k.startsWith("__reactFiber$") || k.startsWith("__reactContainer$"),
  );

  if (!key) return null;
  return (element as any)[key];
}

export function getReactProps(element: Element) {
  const key = Object.keys(element).find((k) => k.startsWith("__reactProps$"));
  if (!key) return null;
  return (element as any)[key];
}
