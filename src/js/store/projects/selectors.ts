import { RouteComponentProps } from 'react-router-dom';
import { createSelector } from 'reselect';

import { AppState } from '@/store';
import { Product } from '@/store/products/reducer';
import { selectProduct } from '@/store/products/selectors';
import {
  Project,
  ProjectsByProductState,
  ProjectsState,
} from '@/store/projects/reducer';

export const selectProjectState = (appState: AppState): ProjectsState =>
  appState.projects;

export const selectProjectsByProduct = createSelector(
  [selectProjectState, selectProduct],
  (
    projects: ProjectsState,
    product: Product | null | undefined,
  ): ProjectsByProductState | undefined => {
    if (product) {
      return projects[product.id];
    }
    return undefined;
  },
);

const selectProductId = createSelector(
  [selectProduct],
  (product: Product | null | undefined): string | undefined => {
    if (product) {
      return product.id;
    }
    return undefined;
  },
);

export const selectProjectSlug = (
  appState: AppState,
  { match: { params } }: RouteComponentProps<{ projectSlug?: string }>,
) => params.projectSlug;

export const selectProjectNotFound = createSelector(
  [selectProjectsByProduct, selectProjectSlug],
  (projects, projectSlug): boolean => Boolean(projectSlug && projects),
);
export const selectProject = createSelector(
  [
    selectProjectsByProduct,
    selectProjectSlug,
    selectProjectNotFound,
    selectProjectState,
    selectProductId,
  ],
  (productProjects, projectSlug, notFound, projects, product) => {
    let project: Project | undefined;
    if (!projectSlug) {
      return undefined;
    }
    if (productProjects) {
      project = productProjects.projects.find(
        p => p.slug === projectSlug || p.old_slugs.includes(projectSlug),
      );
      return project;
    }
    if (projects.projects && product !== undefined) {
      project = projects.projects[product];
    }
    if (project) {
      return project;
    }
    return notFound ? null : undefined;
  },
);
