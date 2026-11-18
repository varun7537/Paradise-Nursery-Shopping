// /src/redux/reducers/userReducer.js

const initialState = {
  user: null,
  isLoading: false,
  error: null,
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_USER_REQUEST':
      return { ...state, isLoading: true };
    case 'FETCH_USER_SUCCESS':
      return { ...state, isLoading: false, user: action.payload };
    case 'FETCH_USER_FAILURE':
      return { ...state, isLoading: false, error: action.error };
    default:
      return state;
  }
};

export default userReducer;
