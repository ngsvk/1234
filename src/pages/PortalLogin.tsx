import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, LogIn } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useContent } from '@/contexts/ContentContext';

export default function PortalLogin() {
  const { content } = useContent();
  const portalSettings = content.portal || { staffLoginEnabled: true, studentLoginEnabled: true };
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<'staff' | 'student'>(
    portalSettings.staffLoginEnabled ? 'staff' : 'student'
  );
  const { toast } = useToast();
  const navigate = useNavigate();

  // Update userType if settings change
  useEffect(() => {
    if (!portalSettings.staffLoginEnabled && userType === 'staff') {
      setUserType('student');
    } else if (!portalSettings.studentLoginEnabled && userType === 'student') {
      setUserType('staff');
    }
  }, [portalSettings, userType]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter both username and password',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await supabase.functions.invoke('portal-login', {
        body: { username: username.trim(), password: password.trim(), userType },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Login failed');
      }

      if (response.data?.success) {
        // Store session in localStorage
        localStorage.setItem('portal_user', JSON.stringify(response.data.user));

        toast({
          title: 'Login Successful',
          description: `Welcome, ${response.data.user.full_name}!`,
        });

        // Redirect based on user type
        if (response.data.user.user_type === 'staff') {
          navigate('/portal/staff');
        } else {
          navigate('/portal');
        }
      } else {
        throw new Error(response.data?.message || 'Invalid credentials');
      }
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid username or password',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 pt-24">
        <section className="gradient-hero py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Portal Login</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Access your personalized dashboard
            </p>
          </div>
        </section>

        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <Card className="max-w-md mx-auto">
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <LogIn className="text-primary" size={32} />
                </div>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>Enter your credentials to access the portal</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Only show tabs if both login options are enabled */}
                {portalSettings.staffLoginEnabled && portalSettings.studentLoginEnabled && (
                  <Tabs
                    value={userType}
                    onValueChange={(v) => setUserType(v as 'staff' | 'student')}
                    className="mb-6"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      {portalSettings.staffLoginEnabled && <TabsTrigger value="staff">Staff</TabsTrigger>}
                      {portalSettings.studentLoginEnabled && <TabsTrigger value="student">Student</TabsTrigger>}
                    </TabsList>
                  </Tabs>
                )}
                
                {/* Show message if neither option is enabled */}
                {!portalSettings.staffLoginEnabled && !portalSettings.studentLoginEnabled && (
                  <div className="mb-6 p-4 bg-muted rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">
                      Portal login is currently unavailable. Please contact administration.
                    </p>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <User
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        size={18}
                      />
                      <Input
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-10"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        size={18}
                      />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading || (!portalSettings.staffLoginEnabled && !portalSettings.studentLoginEnabled)}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>

                <p className="text-sm text-muted-foreground text-center mt-4">
                  Contact the administration if you forgot your credentials
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
