import { create } from 'zustand';

/** Which app / project the computer shows. Lives outside the screen so other places can deep-link into it. */
export const useOsStore = create((set) => ({
    app: 'projects',
    projectId: null,
    category: 'all',
    open: (app, projectId = null) => set({ app, projectId }),
    setProject: (projectId) => set({ projectId }),
    setCategory: (category) => set({ category, projectId: null })
}));
