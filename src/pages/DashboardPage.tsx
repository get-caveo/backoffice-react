import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Shield, Key } from 'lucide-react';

export function DashboardPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold">Backoffice React</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">{user?.name || user?.email}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            You're successfully authenticated with our secure system.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>User Profile</CardTitle>
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="font-semibold text-slate-700 dark:text-slate-300">Email</dt>
                  <dd className="text-slate-600 dark:text-slate-400">{user?.email}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700 dark:text-slate-300">Name</dt>
                  <dd className="text-slate-600 dark:text-slate-400">{user?.name || 'Not set'}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700 dark:text-slate-300">User ID</dt>
                  <dd className="text-slate-600 dark:text-slate-400 font-mono text-xs">{user?.id}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Security</CardTitle>
                <Shield className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>Security features enabled</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center text-green-600 dark:text-green-400">
                  <span className="mr-2">✓</span>
                  JWT Token Authentication
                </li>
                <li className="flex items-center text-green-600 dark:text-green-400">
                  <span className="mr-2">✓</span>
                  CSRF Protection
                </li>
                <li className="flex items-center text-green-600 dark:text-green-400">
                  <span className="mr-2">✓</span>
                  Encrypted Token Storage
                </li>
                <li className="flex items-center text-green-600 dark:text-green-400">
                  <span className="mr-2">✓</span>
                  Device Fingerprinting
                </li>
                <li className="flex items-center text-green-600 dark:text-green-400">
                  <span className="mr-2">✓</span>
                  Auto Token Refresh
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Session Info</CardTitle>
                <Key className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>Active session details</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="font-semibold text-slate-700 dark:text-slate-300">Status</dt>
                  <dd className="text-green-600 dark:text-green-400">Active</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700 dark:text-slate-300">Token Type</dt>
                  <dd className="text-slate-600 dark:text-slate-400">JWT Bearer</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700 dark:text-slate-300">Storage</dt>
                  <dd className="text-slate-600 dark:text-slate-400">Encrypted Session</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Security Improvements Implemented</CardTitle>
            <CardDescription>Enhanced authentication security features</CardDescription>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold text-base mb-2">1. Encrypted Token Storage</h4>
                <p className="text-slate-600 dark:text-slate-400">
                  Tokens are encrypted before being stored in sessionStorage using a simple encryption algorithm.
                  This adds an extra layer of security compared to plain text storage.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-base mb-2">2. CSRF Token Protection</h4>
                <p className="text-slate-600 dark:text-slate-400">
                  A unique CSRF token is generated on login and stored in sessionStorage. This token should be
                  included in all state-changing requests to prevent Cross-Site Request Forgery attacks.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-base mb-2">3. Device Fingerprinting</h4>
                <p className="text-slate-600 dark:text-slate-400">
                  A unique device fingerprint is generated based on browser and system properties. Tokens are
                  bound to this fingerprint, making them invalid if used from a different device.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-base mb-2">4. Automatic Token Refresh</h4>
                <p className="text-slate-600 dark:text-slate-400">
                  Access tokens are automatically refreshed before expiration using the refresh token. This
                  ensures seamless user experience while maintaining security.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-base mb-2">5. Input Sanitization</h4>
                <p className="text-slate-600 dark:text-slate-400">
                  All user inputs are sanitized to prevent XSS attacks. Email validation and strong password
                  requirements are enforced.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-base mb-2">6. Session Storage over Local Storage</h4>
                <p className="text-slate-600 dark:text-slate-400">
                  Using sessionStorage instead of localStorage means tokens are cleared when the browser is
                  closed, reducing the attack window for token theft.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
