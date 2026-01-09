import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Ideally we would validate the token here or fetch user profile
        // For now, if we have a token, we assume we are logged in.
        // Use username from local storage if checking existence? 
        // The backend login returns token but not user details other than what we might decode or store.
        // The spec says "Store the access_token...".
        // We'll store username too for UI purposes.
        const storedUser = localStorage.getItem('username');
        if (token && storedUser) {
            setUser({ username: storedUser });
        }
    }, [token]);

    const login = async (username, password) => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.login(username, password);
            // data: { access_token, token_type }
            const accessToken = data.access_token;

            localStorage.setItem('token', accessToken);
            localStorage.setItem('username', username);

            setToken(accessToken);
            setUser({ username });
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setToken(null);
        setUser(null);
    };

    const register = async (username, password) => {
        setLoading(true);
        setError(null);
        try {
            await api.register(username, password);
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout, register, loading, error }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
