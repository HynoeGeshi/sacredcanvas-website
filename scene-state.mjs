export function sceneState(progress, reducedMotion = false) {
  const clamp = (n) => Math.max(0, Math.min(1, n));
  const p = reducedMotion ? 0.22 : clamp(Number.isFinite(progress) ? progress : 0);
  const smooth = (a2, b) => {
    const t = clamp((p - a2) / (b - a2));
    return t * t * (3 - 2 * t);
  };
  const night = smooth(0.3, 0.94);
  return { progress: p, night, sunY: 24 + smooth(0, 0.58) * 53, sunOpacity: 1 - smooth(0.44, 0.59), moonY: 37 - smooth(0.55, 0.93) * 18, moonOpacity: smooth(0.57, 0.9), starsOpacity: smooth(0.62, 0.95), photoBrightness: 1 - night * 0.82, photoSaturation: 1 - night * 0.44, reflectionOpacity: (1 - smooth(0.4, 0.67)) * 0.46 };
}
