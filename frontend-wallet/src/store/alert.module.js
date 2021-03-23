const state = {
  type: null,
  message: null
}

const actions = {
  success ({ commit }, message) {
    commit('success', message)
  },
  error ({ commit }, message) {
    commit('error', message)
  },
  clear ({ commit }, message) {
    commit('success', message)
  }
}

const mutations = {
  success (state, message) {
    state.type = 'success'
    state.message = message
  },
  error (state, message) {
    state.type = 'error'
    state.message = message
  },
  clear (state) {
    state.type = null
    state.message = null
  }
}

const getters = {
  getAlert: (state) => ({ type: state.type, message: state.message}),
};

export const alert = {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
}
