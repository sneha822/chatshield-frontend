import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { register, loading, error: authError } = useAuth();
    const [localError, setLocalError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        if (password.length < 4) {
            setLocalError('Password must be at least 4 characters');
            return;
        }

        const success = await register(username, password);
        if (success) {
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-main px-4">
            <div className="w-full max-w-sm animate-fade-in">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                        <img src="/images/logo.png" alt="ChatShield Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-2xl font-semibold text-text-main">Create account</h1>
                    <p className="text-text-muted text-sm mt-1">Join ChatShield today</p>
                </div>

                {(localError || authError) && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-4 text-center">
                        {localError || authError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1.5">
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full px-3.5 py-2.5 bg-input-bg border border-border-base rounded-lg text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow placeholder:text-gray-600"
                            placeholder="Choose a username"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1.5">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-3.5 py-2.5 bg-input-bg border border-border-base rounded-lg text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow placeholder:text-gray-600"
                            placeholder="Create a password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-2.5 rounded-lg font-medium text-sm hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? 'Creating account...' : 'Create account'}
                    </button>
                </form>

                <p className="text-center text-sm text-text-muted mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary font-medium hover:text-primary-hover hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
