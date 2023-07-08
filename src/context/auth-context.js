import React, {useState, useEffect } from 'react'

const AuthContext = React.createContext({
    user: {},
    login: (user) => {},
    logout: () => {},
})

export const AuthContextProvider = (props) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check if user is logged in from localStorage
        const loggedInUser = localStorage.getItem("user");
        if (loggedInUser) {
            setUser(JSON.parse(loggedInUser));
        }
    }, []);

    const login = (user) => {
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
      };
    
    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
    };

    const contextValue = {
        user: user,
        login: login, 
        logout: logout
    }

    return <AuthContext.Provider value={contextValue}> {props.children} </AuthContext.Provider>
};

export default AuthContext;