import { describe, expect, it } from 'vitest';
import { demoCategories, demoPeople, demoRelationships, SELF_ID } from '../src/data/demo-network';
import { buildGraphLayout } from '../src/services/graph-layout';
import { focusViewport, fitViewport, hitTestNode, MAX_SCALE, MIN_SCALE, NODE_RADIUS, resizeViewport, screenToWorld, worldToScreen, zoomAtPoint } from '../src/services/graph-math';
import { searchPeople } from '../src/services/search';
import { getPersonInitials, getPersonName, relationshipTypeMetadata } from '../src/types/network';
import type { GraphMode, Person } from '../src/types/network';

describe('fictional network', () => {
  it('has thirty contacts, one self node, valid categories and no orphan relationships', () => {
    expect(demoPeople.filter((person) => !person.isSelf)).toHaveLength(30);
    expect(demoPeople.filter((person) => person.isSelf).map((person) => person.id)).toEqual([SELF_ID]);
    const personIds = new Set(demoPeople.map((person) => person.id));
    expect(personIds.size).toBe(demoPeople.length);
    expect(new Set(demoRelationships.map((edge) => edge.id)).size).toBe(demoRelationships.length);
    for (const edge of demoRelationships) {
      expect(personIds.has(edge.sourcePersonId)).toBe(true);
      expect(personIds.has(edge.targetPersonId)).toBe(true);
      expect(edge.sourcePersonId).not.toBe(edge.targetPersonId);
    }
    for (const person of demoPeople) {
      expect(person.categoryIds.every((id) => demoCategories.some((category) => category.id === id))).toBe(true);
    }
  });

  it('retains asymmetric semantics and permits handle-only contacts', () => {
    expect(relationshipTypeMetadata.parent_of.directed).toBe(true);
    expect(relationshipTypeMetadata.introduced_by.directed).toBe(true);
    expect(relationshipTypeMetadata.friend.directed).toBe(false);
    const person = demoPeople.find((entry) => entry.id === 'pixelpilot')!;
    expect(person.firstName).toBe('');
    expect(getPersonName(person)).toBe('Pixelpilot');
    expect(getPersonInitials(person)).toBe('PI');
    expect(person.contactMethods.some((method) => method.type === 'phone')).toBe(false);
  });
});

describe.each<GraphMode>(['network', 'categories'])('%s graph layout', (mode) => {
  it('is deterministic, keeps self centered and avoids overlapping node targets', () => {
    const layout = buildGraphLayout(demoPeople, demoCategories, demoRelationships, mode);
    expect(buildGraphLayout([...demoPeople].reverse(), demoCategories, [...demoRelationships].reverse(), mode)).toEqual(layout);
    expect(layout.nodes).toHaveLength(demoPeople.length);
    expect(layout.clusters).toHaveLength(4);
    expect(layout.nodes.find((node) => node.personId === SELF_ID)).toEqual({ personId: SELF_ID, x: 0, y: 0 });
    for (let i = 0; i < layout.nodes.length; i += 1) {
      for (let j = i + 1; j < layout.nodes.length; j += 1) {
        expect(Math.hypot(layout.nodes[i]!.x - layout.nodes[j]!.x, layout.nodes[i]!.y - layout.nodes[j]!.y)).toBeGreaterThanOrEqual(85);
      }
    }
  });

  it('does not mutate input and handles uncategorized people and empty input', () => {
    const before = JSON.stringify({ people: demoPeople, categories: demoCategories, relationships: demoRelationships });
    buildGraphLayout(demoPeople, demoCategories, demoRelationships, mode);
    expect(JSON.stringify({ people: demoPeople, categories: demoCategories, relationships: demoRelationships })).toBe(before);
    expect(buildGraphLayout([], [], [], mode)).toEqual({ nodes: [], clusters: [] });
    const person = { ...demoPeople[1]!, categoryIds: [] };
    const layout = buildGraphLayout([demoPeople[0]!, person], [], [], mode);
    expect(layout.nodes).toHaveLength(2);
    expect(layout.nodes.every((node) => Number.isFinite(node.x) && Number.isFinite(node.y))).toBe(true);
  });
});

it('relationships change network positions while category mode stays stable', () => {
  expect(buildGraphLayout(demoPeople, demoCategories, demoRelationships, 'network').nodes)
    .not.toEqual(buildGraphLayout(demoPeople, demoCategories, [], 'network').nodes);
  expect(buildGraphLayout(demoPeople, demoCategories, demoRelationships, 'categories'))
    .toEqual(buildGraphLayout(demoPeople, demoCategories, [], 'categories'));
});

describe('search and filters', () => {
  const search = (query: string, category: string | null = null, favoritesOnly = false) => searchPeople(demoPeople, demoCategories, query, category, favoritesOnly).map((person) => person.id);

  it.each([
    ['KRÜGER', 'lisa'], ['Krueger', 'lisa'], ['kuhn', 'max'], ['mama', 'sabine'],
    ['studio morgen', 'anna'], ['Elektriker', 'max'], ['Spieleabend', 'lisa'],
    ['Lisas Geburtstag', 'alex'], ['demo_pixelpilot', 'pixelpilot'], ['Bremen', 'jonas'],
    ['famILie', 'helga'], ['Türkisch', 'amira'],
  ])('finds %s in name, category, skill, contact methods or context', (query, expectedId) => {
    expect(search(query)).toContain(expectedId);
  });

  it('combines filters, includes secondary categories and excludes self', () => {
    expect(search('')).toHaveLength(30);
    expect(search('')).not.toContain(SELF_ID);
    expect(search('Elektriker', 'skills')).toEqual(['max']);
    expect(search('', 'skills', true)).toEqual(['thomas', 'alex']);
    expect(search('no-such-contact')).toEqual([]);
    expect(search('   ')).toEqual(search(''));
  });

  it('matches phone numbers independently of formatting', () => {
    const person: Person = { ...demoPeople[1]!, contactMethods: [{ id: 'test-phone', type: 'phone', value: '+49 (000) 123-456' }] };
    expect(searchPeople([person], demoCategories, '+49 000123456', null, false)).toEqual([person]);
  });
});

describe('viewport math', () => {
  it.each([MIN_SCALE, 0.7, 1.35, MAX_SCALE])('keeps a panned world center and zoom %s while the keyboard opens and closes', (scale) => {
    const initial = { x: 83, y: -129, scale };
    const worldCenter = screenToWorld({ x: 390 / 2, y: 620 / 2 }, initial);
    const keyboardOpen = resizeViewport(initial, 390, 620, 390, 290);
    const resizedCenter = screenToWorld({ x: 390 / 2, y: 290 / 2 }, keyboardOpen);
    expect(resizedCenter.x).toBeCloseTo(worldCenter.x);
    expect(resizedCenter.y).toBeCloseTo(worldCenter.y);
    expect(keyboardOpen.scale).toBe(scale);
    expect(resizeViewport(keyboardOpen, 390, 290, 390, 620)).toEqual(initial);
  });

  it('keeps a focused contact centered after a portrait-to-landscape resize', () => {
    const contact = { x: -214, y: 186 };
    const viewport = focusViewport(contact, 390, 620);
    const resized = resizeViewport(viewport, 390, 620, 844, 240);
    const position = worldToScreen(contact, resized);
    expect(position.x).toBeCloseTo(844 / 2);
    expect(position.y).toBeCloseTo(240 / 2);
    expect(resized.scale).toBe(viewport.scale);
  });

  it.each([MIN_SCALE, 0.7, 1, 1.8, MAX_SCALE])('converts and hits accurately at zoom %s', (scale) => {
    const viewport = { x: 107, y: -83, scale };
    const node = { personId: 'target', x: -134, y: 276 };
    const screen = worldToScreen(node, viewport);
    const world = screenToWorld(screen, viewport);
    expect(world.x).toBeCloseTo(node.x);
    expect(world.y).toBeCloseTo(node.y);
    expect(hitTestNode([node], world, scale)).toBe(node);
    expect(hitTestNode([node], { x: node.x + 200, y: node.y }, scale)).toBeNull();
  });

  it('retains a usable 44px hit target when zoomed out and selects the nearest node', () => {
    const node = { personId: 'a', x: 0, y: 0 };
    const neighbor = { personId: 'b', x: 90, y: 0 };
    expect(hitTestNode([node], { x: 20 / MIN_SCALE, y: 0 }, MIN_SCALE)).toBe(node);
    expect(hitTestNode([node, neighbor], { x: 52, y: 0 }, MIN_SCALE)).toBe(neighbor);
    expect(hitTestNode([node], { x: NODE_RADIUS + 1, y: 0 }, MAX_SCALE)).toBeNull();
  });

  it.each([0.01, 0.7, 1.5, 100])('zooms around its anchor with factor %s, including at limits', (factor) => {
    const viewport = { x: 100, y: 45, scale: 1 };
    const anchor = { x: 250, y: 400 };
    const fixedWorldPoint = screenToWorld(anchor, viewport);
    const next = zoomAtPoint(viewport, factor, anchor);
    const actual = worldToScreen(fixedWorldPoint, next);
    expect(next.scale).toBeGreaterThanOrEqual(MIN_SCALE);
    expect(next.scale).toBeLessThanOrEqual(MAX_SCALE);
    expect(actual.x).toBeCloseTo(anchor.x);
    expect(actual.y).toBeCloseTo(anchor.y);
  });

  it('fits the complete demo into a phone viewport and centers focused nodes', () => {
    const nodes = buildGraphLayout(demoPeople, demoCategories, demoRelationships, 'network').nodes;
    const fit = fitViewport(nodes, 390, 620);
    for (const node of nodes) {
      const position = worldToScreen(node, fit);
      expect(position.x - NODE_RADIUS * fit.scale).toBeGreaterThanOrEqual(0);
      expect(position.x + NODE_RADIUS * fit.scale).toBeLessThanOrEqual(390);
      expect(position.y - NODE_RADIUS * fit.scale).toBeGreaterThanOrEqual(0);
      expect(position.y + NODE_RADIUS * fit.scale).toBeLessThanOrEqual(620);
    }
    const focused = worldToScreen(nodes[4]!, focusViewport(nodes[4]!, 390, 620));
    expect(focused).toEqual({ x: 195, y: 310 });
    expect(fitViewport([], 390, 620)).toEqual({ x: 195, y: 310, scale: 1 });
  });
});
