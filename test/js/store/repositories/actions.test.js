import fetchMock from 'fetch-mock';

import * as actions from '@/store/repositories/actions';

import { storeWithThunk } from './../../utils';

describe('refreshRepos', () => {
  let url;

  beforeAll(() => {
    url = window.api_urls.repository_list();
  });

  test('dispatches RefreshRepos action', () => {
    const store = storeWithThunk({});
    fetchMock.getOnce(url, {
      next: null,
      results: [],
    });
    fetchMock.postOnce(window.api_urls.user_refresh(), {
      status: 204,
      body: {},
    });
    const RefreshReposRequested = {
      type: 'REFRESH_REPOS_REQUESTED',
    };
    const RefreshReposAccepted = {
      type: 'REFRESH_REPOS_ACCEPTED',
    };

    expect.assertions(1);
    return store.dispatch(actions.refreshRepos()).then(() => {
      expect(store.getActions()).toEqual([
        RefreshReposRequested,
        RefreshReposAccepted,
      ]);
    });
  });

  describe('error', () => {
    test('dispatches REFRESH_REPOS_REJECTED action', () => {
      const store = storeWithThunk({});
      fetchMock.postOnce(window.api_urls.user_refresh(), {
        status: 500,
        body: { non_field_errors: ['Foobar'] },
      });
      const started = {
        type: 'REFRESH_REPOS_REQUESTED',
      };
      const failed = {
        type: 'REFRESH_REPOS_REJECTED',
      };

      expect.assertions(5);
      return store.dispatch(actions.refreshRepos()).catch(() => {
        const allActions = store.getActions();

        expect(allActions[0]).toEqual(started);
        expect(allActions[1].type).toEqual('ERROR_ADDED');
        expect(allActions[1].payload.message).toEqual(['Foobar']);
        expect(allActions[2]).toEqual(failed);
        expect(window.console.error).toHaveBeenCalled();
      });
    });
  });
});

describe('reposRefreshing', () => {
  test('returns REFRESHING_REPOS action', () => {
    const expected = { type: 'REFRESHING_REPOS' };

    expect(actions.reposRefreshing()).toEqual(expected);
  });
});