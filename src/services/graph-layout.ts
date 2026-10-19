import type { Category, GraphLayout, GraphMode, GraphNode, Person, Relationship } from '../types/network';

const MIN_DISTANCE = 94;
const TAU = Math.PI * 2;

function compareId(a: { id: string }, b: { id: string }): number {
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

function localPosition(index: number, count: number): { x: number; y: number } {
  if (index === 0) return { x: 0, y: 0 };
  if (count <= 10) {
    const ringCount = count - 1;
    const radius = Math.max(112, MIN_DISTANCE / (2 * Math.sin(Math.PI / Math.max(2, ringCount))));
    const angle = -Math.PI / 2 + ((index - 1) / ringCount) * TAU;
    return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
  }
  let remaining = index - 1;
  let ring = 1;
  while (remaining >= ring * 7) {
    remaining -= ring * 7;
    ring += 1;
  }
  const angle = -Math.PI / 2 + (remaining / (ring * 7)) * TAU;
  return { x: Math.cos(angle) * ring * 116, y: Math.sin(angle) * ring * 116 };
}

/**
 * One finite, deterministic calculation per structural change. Multiple categories
 * remain in the model; the first known category supplies the spatial home.
 */
export function buildGraphLayout(
  people: Person[],
  categories: Category[],
  relationships: Relationship[],
  mode: GraphMode,
): GraphLayout {
  const sortedPeople = [...people].sort(compareId);
  const categoryIds = new Set(categories.map((category) => category.id));
  const primaryCategory = (person: Person) => person.categoryIds.find((id) => categoryIds.has(id)) ?? '__other';
  const groups = new Map<string, Person[]>();
  for (const person of sortedPeople) {
    if (person.isSelf) continue;
    const category = primaryCategory(person);
    const group = groups.get(category) ?? [];
    group.push(person);
    groups.set(category, group);
  }

  const largestGroup = Math.max(0, ...Array.from(groups.values(), (group) => group.length));
  const clusterRadius = Math.max(285, Math.sqrt(largestGroup) * 90);
  // Four familiar quadrants: family / friends on the left, work / skills on the right.
  const quadrants = [-Math.PI * 0.75, Math.PI * 0.75, -Math.PI * 0.25, Math.PI * 0.25];
  const clusters = categories.map((category, index) => {
    const angle = categories.length === 4 ? quadrants[index]! : -Math.PI / 2 + (index / categories.length) * TAU;
    return { categoryId: category.id, x: Math.cos(angle) * clusterRadius, y: Math.sin(angle) * clusterRadius };
  });
  const centers = new Map(clusters.map((cluster) => [cluster.categoryId, cluster]));
  const nodes: GraphNode[] = [];
  const selfIds = new Set(sortedPeople.filter((person) => person.isSelf).map((person) => person.id));
  for (const person of sortedPeople.filter((person) => person.isSelf)) nodes.push({ personId: person.id, x: 0, y: 0 });

  for (const [categoryId, members] of groups) {
    const center = centers.get(categoryId) ?? { x: 0, y: clusterRadius + 190 };
    members.forEach((person, index) => {
      const local = localPosition(index, members.length);
      nodes.push({ personId: person.id, x: center.x + local.x, y: center.y + local.y });
    });
  }

  const targets = nodes.map((node) => ({ x: node.x, y: node.y }));
  const indexById = new Map(nodes.map((node, index) => [node.personId, index]));
  const validEdges = [...relationships].sort(compareId).filter((edge) => indexById.has(edge.sourcePersonId) && indexById.has(edge.targetPersonId) && edge.sourcePersonId !== edge.targetPersonId);

  if (mode === 'network') {
    // Weak category anchors retain orientation; edges bring acquaintances closer.
    for (let iteration = 0; iteration < 100; iteration += 1) {
      const forces = nodes.map((node, index) => ({ x: (targets[index]!.x - node.x) * 0.055, y: (targets[index]!.y - node.y) * 0.055 }));
      for (const edge of validEdges) {
        const sourceIndex = indexById.get(edge.sourcePersonId)!;
        const targetIndex = indexById.get(edge.targetPersonId)!;
        const source = nodes[sourceIndex]!;
        const target = nodes[targetIndex]!;
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const distance = Math.hypot(dx, dy) || 1;
        const isSelfEdge = selfIds.has(source.personId) || selfIds.has(target.personId);
        const restLength = isSelfEdge ? 260 : 140;
        const strength = isSelfEdge ? 0.006 : 0.012;
        const force = (distance - restLength) * strength / distance;
        forces[sourceIndex]!.x += dx * force;
        forces[sourceIndex]!.y += dy * force;
        forces[targetIndex]!.x -= dx * force;
        forces[targetIndex]!.y -= dy * force;
      }
      nodes.forEach((node, index) => {
        if (selfIds.has(node.personId)) return;
        node.x += forces[index]!.x;
        node.y += forces[index]!.y;
      });
      separateNodes(nodes, selfIds);
    }
  }

  // Resolve collisions also for custom category sets and uncategorized contacts.
  for (let pass = 0; pass < 100; pass += 1) {
    if (!separateNodes(nodes, selfIds)) break;
  }
  return {
    nodes: nodes.map((node) => ({ ...node, x: Math.round(node.x * 100) / 100, y: Math.round(node.y * 100) / 100 })),
    clusters,
  };
}

function separateNodes(nodes: GraphNode[], selfIds: Set<string>): boolean {
  let moved = false;
  for (let a = 0; a < nodes.length; a += 1) {
    for (let b = a + 1; b < nodes.length; b += 1) {
      const first = nodes[a]!;
      const second = nodes[b]!;
      if (selfIds.has(first.personId) && selfIds.has(second.personId)) continue;
      let dx = second.x - first.x;
      let dy = second.y - first.y;
      let distance = Math.hypot(dx, dy);
      if (distance >= MIN_DISTANCE) continue;
      if (distance < 0.001) {
        const angle = (a * 2.399963 + b) % TAU;
        dx = Math.cos(angle);
        dy = Math.sin(angle);
        distance = 1;
      }
      const shift = (MIN_DISTANCE - distance + 0.01) / distance;
      const firstShare = selfIds.has(first.personId) ? 0 : selfIds.has(second.personId) ? 1 : 0.5;
      const secondShare = 1 - firstShare;
      first.x -= dx * shift * firstShare;
      first.y -= dy * shift * firstShare;
      second.x += dx * shift * secondShare;
      second.y += dy * shift * secondShare;
      moved = true;
    }
  }
  return moved;
}
