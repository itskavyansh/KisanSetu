import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../logo.svg';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative bg-white overflow-hidden">
      {/* Soft Green Glow */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at center, #8FFFB0, transparent)
          `,
        }}
      />
      <section className="relative z-10 flex h-screen items-center justify-center px-4 py-8 md:py-10 overflow-hidden">
      <form onSubmit={handleSubmit} className="relative bg-white m-auto h-fit w-full max-w-sm overflow-hidden rounded-xl border border-gray-200 shadow-[0_10px_30px_rgba(0,0,0,0.15)]" style={{ backgroundColor: 'rgba(255,255,255,1)' }}>
        <div className="bg-white p-6 pb-4" style={{ backgroundColor: 'rgba(255,255,255,1)' }}>
          <div className="text-center">
            <h1 className="mb-1 mt-3 text-xl font-semibold">Sign In to KisanSetu</h1>
            <p className="text-sm text-gray-600">Welcome back! Sign in to continue</p>
          </div>

          <div className="mt-4 space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm">Email</label>
              <input
                type="email"
                required
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-kisan-green focus:border-kisan-green"
              />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <label htmlFor="pwd" className="text-sm">Password</label>
                <Link to="#" className="text-sm text-kisan-green hover:text-green-600">Forgot your Password?</Link>
              </div>
              <input
                type="password"
                required
                name="pwd"
                id="pwd"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-kisan-green focus:border-kisan-green"
              />
            </div>

            <button type="submit" disabled={loading} className="w-full rounded-md bg-kisan-green py-2 text-sm font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kisan-green disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>

          <div className="my-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <hr className="border-dashed" />
            <span className="text-xs text-gray-500">Or continue with</span>
            <hr className="border-dashed" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button type="button" className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50">
              <svg xmlns="http://www.w3.org/2000/svg" width="0.98em" height="1em" viewBox="0 0 256 262">
                <path fill="#4285f4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"></path>
                <path fill="#34a853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"></path>
                <path fill="#fbbc05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"></path>
                <path fill="#eb4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"></path>
              </svg>
              <span>Google</span>
            </button>
            <button type="button" className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50">
              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256">
                <path fill="#f1511b" d="M121.666 121.666H0V0h121.666z"></path>
                <path fill="#80cc28" d="M256 121.666H134.335V0H256z"></path>
                <path fill="#00adef" d="M121.663 256.002H0V134.336h121.663z"></path>
                <path fill="#fbbc09" d="M256 256.002H134.335V134.336H256z"></path>
              </svg>
              <span>Microsoft</span>
            </button>
          </div>
        </div>

        <div className="p-3 border-t border-gray-200 bg-white">
          <p className="text-center text-sm text-gray-700">
            Don't have an account?
            <Link to="/register" className="px-2 text-kisan-green hover:text-green-600">Create account</Link>
          </p>
        </div>
      </form>
      </section>
    </div>
  );
};

export default LoginPage;
