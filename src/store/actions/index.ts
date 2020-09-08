import { ActionTree, ActionContext } from 'vuex';
import { State } from '@/store/state';
import { Mutations, MutationTypes } from '@/store/mutations';
import GithubAPI from '@/apis/github';

type AugmentedActionContext = {
  commit<K extends keyof Mutations>(
    key: K,
    payload: Parameters<Mutations[K]>[1],
  ): ReturnType<Mutations[K]>;
} & Omit<ActionContext<State, State>, 'commit'>;

export enum ActionTypes {
  GET_PROFILE = 'GET_PROFILE',
}

export interface Actions {
  [ActionTypes.GET_PROFILE](context: AugmentedActionContext, payload: string): Promise<void>;
}

export const actions: ActionTree<State, State> & Actions = {
  [ActionTypes.GET_PROFILE]({ commit }, name) {
    return GithubAPI.getUser(name).then(user => {
      commit(MutationTypes.SET_NAME, user.name);
      commit(MutationTypes.SET_BIO, user.bio || '');
      commit(MutationTypes.SET_PHOTO, user.avatar_url || '');
    });
  },
};
