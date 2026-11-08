import { createContext, useContext, useReducer } from "react";

const AuthContext = createContext(null);

const initialState = { user: null };

function authReducer(state, action) {
  switch (action.type) {
    case "LOGGED_IN":
      return { ...state, user: action.payload };
    case "LOGGED_OUT":
      return { ...state, user: null };
    default:
      throw new Error(`Unknown auth action: ${action.type}`);
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const value = {
    user: state.user,
    logIn: (user) => dispatch({ type: "LOGGED_IN", payload: user }),
    logOut: () => dispatch({ type: "LOGGED_OUT" }),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used inside an <AuthProvider>.");
  }
  return context;
}
