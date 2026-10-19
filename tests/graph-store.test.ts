import { afterEach, describe, expect, it } from 'vitest';
import { useGraphStore } from '../src/stores/graph.store';

afterEach(() => useGraphStore.setState(useGraphStore.getInitialState(), true));

describe('focus requests between screens', () => {
  it('consumes a focus once, so returning to the graph cannot replay an old selection', () => {
    useGraphStore.getState().requestFocus('alex');
    const request = useGraphStore.getState().focusRequest!;
    expect(request.personId).toBe('alex');
    expect(useGraphStore.getState().consumeFocusRequest(request.revision)).toBe(true);
    expect(useGraphStore.getState().focusRequest).toBeNull();

    // Selecting another node or resetting the overview must survive tab navigation.
    useGraphStore.getState().selectPerson('lena');
    expect(useGraphStore.getState().consumeFocusRequest(request.revision)).toBe(false);
    expect(useGraphStore.getState().selectedPersonId).toBe('lena');
    useGraphStore.getState().selectPerson(null);
    expect(useGraphStore.getState().focusRequest).toBeNull();
  });

  it('issues unique revisions even after a request has been consumed', () => {
    useGraphStore.getState().requestFocus('alex');
    const first = useGraphStore.getState().focusRequest!;
    useGraphStore.getState().consumeFocusRequest(first.revision);
    useGraphStore.getState().requestFocus('alex');
    const second = useGraphStore.getState().focusRequest!;
    expect(second.revision).toBeGreaterThan(first.revision);
    expect(useGraphStore.getState().consumeFocusRequest(first.revision)).toBe(false);
    expect(useGraphStore.getState().focusRequest).toEqual(second);
    expect(useGraphStore.getState().consumeFocusRequest(second.revision)).toBe(true);
  });

  it('does not clear a newer pending request from a stale screen callback', () => {
    useGraphStore.getState().requestFocus('alex');
    const staleRequest = useGraphStore.getState().focusRequest!;
    useGraphStore.getState().requestFocus('lena');
    const latestRequest = useGraphStore.getState().focusRequest!;
    expect(useGraphStore.getState().consumeFocusRequest(staleRequest.revision)).toBe(false);
    expect(useGraphStore.getState().focusRequest).toEqual(latestRequest);
    expect(useGraphStore.getState().selectedPersonId).toBe('lena');
  });
});
