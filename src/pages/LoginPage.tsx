
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useToast } from '@/hooks/use-toast';
// Import httpBase removed as it's not used
import { API_CONFIG } from '../config/environment';
import axios from 'axios';

const LoginPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { state, loginUser } = useAppContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If tenant not loaded, redirect to tenant page
    if (!state.tenant) {
      navigate(`/${slug}`);
    }

    // Don't automatically redirect if already authenticated
    // if (state.isAuthenticated) {
    //   navigate(`/${slug}/dashboard`);
    // }
  }, [slug, navigate, state.tenant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Validation Error",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Store slug
      localStorage.setItem('aroma_slug', slug || '');

      // Make login API call with URLSearchParams
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/login`,
        new URLSearchParams({
          'grant_type': 'password',
          'username': email,
          'password': password,
          'scope': '',
          'client_id': slug || 'string' // Use slug as client_id if available
        }),
        {
          headers: {
            'accept': 'application/json'
          }
        }
      );

      // Store the auth token using the consistent key from API_CONFIG
      localStorage.setItem(API_CONFIG.AUTH_TOKEN_KEY, response.data.access_token);

      // Call loginUser to update state and handle navigation
      await loginUser(email, password);

      toast({
        title: "Login Successful",
        description: "You have been logged in successfully.",
      });

      // Let the user decide where to go next
      navigate(`/${slug}/dashboard`);
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Failed to log in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!state.tenant) {
    return null;  // Don't render until tenant is loaded
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="w-full max-w-md mx-auto lg:w-96">
          <div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-xl">
                {state.tenant.name.charAt(0)}
              </div>
              <h2 className="text-3xl font-bold text-gray-900">{state.tenant.name}</h2>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
          </div>

          <div className="mt-8">
            <div className="mt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="text"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                    />
                    <label htmlFor="remember-me" className="block ml-2 text-sm text-gray-900">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <a href="#" className="font-medium text-brand-600 hover:text-brand-500">
                      Forgot your password?
                    </a>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 ${
                      isLoading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? 'Signing in...' : 'Sign in'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="relative flex-1 hidden w-0 lg:block">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-brand-800" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white">
          <h2 className="text-4xl font-bold">Welcome to {state.tenant.name}</h2>
          <p className="mt-4 text-lg">Sign in to access your dashboard and manage your projects.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
