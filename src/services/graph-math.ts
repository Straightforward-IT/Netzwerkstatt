import type { GraphNode, Point, Viewport } from '../types/network';

export const MIN_SCALE = 0.3;
export const MAX_SCALE = 2.6;
export const NODE_RADIUS = 25;

function clampScale(scale: number): number {
  'worklet';
  return Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale));
}

export function screenToWorld(point: Point, viewport: Viewport): Point {
  'worklet';
  return { x: (point.x - viewport.x) / viewport.scale, y: (point.y - viewport.y) / viewport.scale };
}

export function worldToScreen(point: Point, viewport: Viewport): Point {
  'worklet';
  return { x: point.x * viewport.scale + viewport.x, y: point.y * viewport.scale + viewport.y };
}

/** Keep the same world point centered and retain zoom when the canvas changes size. */
export function resizeViewport(
  viewport: Viewport,
  previousWidth: number,
  previousHeight: number,
  width: number,
  height: number,
): Viewport {
  'worklet';
  return {
    x: viewport.x + (width - previousWidth) / 2,
    y: viewport.y + (height - previousHeight) / 2,
    scale: viewport.scale,
  };
}

/** Keep the world point under the gesture anchor stationary, including at limits. */
export function zoomAtPoint(viewport: Viewport, factor: number, anchor: Point): Viewport {
  'worklet';
  if (!Number.isFinite(factor) || factor <= 0) return viewport;
  const scale = clampScale(viewport.scale * factor);
  const ratio = scale / viewport.scale;
  return {
    x: anchor.x - (anchor.x - viewport.x) * ratio,
    y: anchor.y - (anchor.y - viewport.y) * ratio,
    scale,
  };
}

/** Point is in world coordinates. The closest node wins overlapping hit targets. */
export function hitTestNode(nodes: GraphNode[], point: Point, scale: number): GraphNode | null {
  'worklet';
  const radius = Math.max(NODE_RADIUS, 22 / Math.max(MIN_SCALE, scale));
  let closest: GraphNode | null = null;
  let closestDistance = radius * radius;
  for (const node of nodes) {
    const distance = (node.x - point.x) ** 2 + (node.y - point.y) ** 2;
    if (distance <= closestDistance) {
      closest = node;
      closestDistance = distance;
    }
  }
  return closest;
}

export function fitViewport(nodes: GraphNode[], width: number, height: number): Viewport {
  'worklet';
  if (nodes.length === 0) return { x: width / 2, y: height / 2, scale: 1 };
  let left = Infinity;
  let right = -Infinity;
  let top = Infinity;
  let bottom = -Infinity;
  for (const node of nodes) {
    left = Math.min(left, node.x - NODE_RADIUS);
    right = Math.max(right, node.x + NODE_RADIUS);
    top = Math.min(top, node.y - NODE_RADIUS);
    bottom = Math.max(bottom, node.y + NODE_RADIUS + 24);
  }
  const padding = Math.min(48, Math.max(12, Math.min(width, height) * 0.1));
  const scale = clampScale(Math.min(1, Math.max(1, width - padding * 2) / (right - left), Math.max(1, height - padding * 2) / (bottom - top)));
  return { x: width / 2 - ((left + right) / 2) * scale, y: height / 2 - ((top + bottom) / 2) * scale, scale };
}

export function focusViewport(node: Point, width: number, height: number): Viewport {
  'worklet';
  const scale = 1.35;
  return { x: width / 2 - node.x * scale, y: height / 2 - node.y * scale, scale };
}
