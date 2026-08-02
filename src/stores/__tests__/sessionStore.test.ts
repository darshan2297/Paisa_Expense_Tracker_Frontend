import { useSessionStore } from '@/stores/sessionStore';

describe('useSessionStore', () => {
  beforeEach(() => {
    useSessionStore.setState({ isAuthenticated: false, isHydrating: true });
  });

  it('starts unauthenticated and hydrating', () => {
    const state = useSessionStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isHydrating).toBe(true);
  });

  it('setAuthenticated updates only that field', () => {
    useSessionStore.getState().setAuthenticated(true);
    const state = useSessionStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.isHydrating).toBe(true);
  });

  it('setHydrating updates only that field', () => {
    useSessionStore.getState().setHydrating(false);
    const state = useSessionStore.getState();
    expect(state.isHydrating).toBe(false);
    expect(state.isAuthenticated).toBe(false);
  });
});
