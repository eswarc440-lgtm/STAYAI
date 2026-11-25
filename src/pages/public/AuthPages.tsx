import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { LogOut, ShieldCheck } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input, Label, NativeSelect } from '@/src/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { useAuth } from '@/src/context/AuthContext';
import { useAppState } from '@/src/context/AppStateContext';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  role: z.enum(['customer', 'manager', 'admin']),
});

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Enter your full name'),
    email: z.string().email('Enter a valid email address'),
    phone: z.string().min(6, 'Enter a valid phone number'),
    role: z.enum(['customer', 'manager', 'admin']),
    password: z.string().min(4, 'Password must be at least 4 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

const forgotSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

function AuthFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const { user, profile, assignedRole, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-md px-4 py-14 space-y-5">
      {user ? (
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl font-medium text-navy">
              Signed in to StayAI
            </CardTitle>
            <CardDescription>
              Your account session is active across all StayAI workspaces.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border bg-secondary/40 p-4 text-sm space-y-1.5">
              <div className="font-semibold text-navy">
                {profile?.displayName || user.displayName || 'StayAI Member'}
              </div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
              <div className="pt-1 flex items-center gap-1.5 text-xs font-medium text-primary">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Active workspace role:{' '}
                <span className="capitalize">{assignedRole}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                className="flex-1"
                onClick={() =>
                  navigate(
                    assignedRole === 'admin'
                      ? '/admin'
                      : assignedRole === 'manager'
                        ? '/manager'
                        : '/account'
                  )
                }
              >
                Open Workspace
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  await logout();
                  toast.success('Signed out cleanly');
                }}
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl font-medium text-navy">
              {title}
            </CardTitle>
            <CardDescription>{subtitle}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      )}
    </div>
  );
}

export function LoginPage() {
  const { signInWithGoogle, signInWithCredentials, isSigningIn } = useAuth();
  const { setPreviewRole } = useAppState();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      role: 'customer',
    },
  });

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      toast.success('Signed in with Google');
      navigate('/account');
    } catch (err) {
      toast.error('Google sign-in did not complete', {
        description:
          err instanceof Error
            ? err.message
            : 'Please allow popups or sign in with your email and password below.',
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    const session = await signInWithCredentials({
      email: values.email,
      password: values.password,
      role: values.role,
    });
    setPreviewRole(values.role);
    toast.success(`Welcome back, ${session.displayName}`);
    navigate(
      values.role === 'admin'
        ? '/admin'
        : values.role === 'manager'
          ? '/manager'
          : '/account'
    );
  };

  return (
    <AuthFrame
      title="Sign in to StayAI"
      subtitle="Sign in with any email and password or continue with Google."
    >
      <div className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="login-email">Email address</Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label htmlFor="login-password" className="mb-0">
                Password
              </Label>
              <Link
                to="/forgot-password"
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter any password"
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="login-role">Workspace access</Label>
            <NativeSelect id="login-role" {...register('role')}>
              <option value="customer">Customer Portal</option>
              <option value="manager">Hotel Manager Workspace</option>
              <option value="admin">Platform Admin Console</option>
            </NativeSelect>
          </div>

          <Button type="submit" className="w-full" disabled={isSigningIn}>
            {isSigningIn ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-wider text-muted-foreground">
            <span className="bg-card px-2">Or</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={isSigningIn}
          onClick={handleGoogleLogin}
        >
          Continue with Google
        </Button>

        <p className="text-center text-xs text-muted-foreground pt-1">
          New to StayAI?{' '}
          <Link
            to="/register"
            className="font-medium text-primary hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </AuthFrame>
  );
}

export function RegisterPage() {
  const { signInWithGoogle, registerWithCredentials, isSigningIn } = useAuth();
  const { setPreviewRole } = useAppState();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'customer',
    },
  });

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    const session = await registerWithCredentials({
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      password: values.password,
      role: values.role,
    });
    setPreviewRole(values.role);
    toast.success(`Account created for ${session.displayName}`);
    navigate(
      values.role === 'admin'
        ? '/admin'
        : values.role === 'manager'
          ? '/manager'
          : '/account'
    );
  };

  return (
    <AuthFrame
      title="Create your StayAI account"
      subtitle="Register with your details to start booking stays or managing properties."
    >
      <div className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
          <div>
            <Label htmlFor="reg-name">Full name</Label>
            <Input
              id="reg-name"
              placeholder="Ananya Deshmukh"
              {...register('fullName')}
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-destructive">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="reg-email">Email address</Label>
            <Input
              id="reg-email"
              type="email"
              placeholder="ananya@example.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="reg-phone">Mobile number</Label>
              <Input
                id="reg-phone"
                type="tel"
                placeholder="+91 98450 11223"
                {...register('phone')}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="reg-role">Account role</Label>
              <NativeSelect id="reg-role" {...register('role')}>
                <option value="customer">Customer</option>
                <option value="manager">Hotel Manager</option>
                <option value="admin">Platform Admin</option>
              </NativeSelect>
            </div>
          </div>

          <div>
            <Label htmlFor="reg-pass">Password</Label>
            <Input id="reg-pass" type="password" {...register('password')} />
            {errors.password && (
              <p className="mt-1 text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="reg-confirm">Confirm password</Label>
            <Input
              id="reg-confirm"
              type="password"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSigningIn}>
            {isSigningIn ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={isSigningIn}
          onClick={async () => {
            try {
              await signInWithGoogle();
              toast.success('Signed in with Google');
              navigate('/account');
            } catch (err) {
              toast.error('Google sign-in failed', {
                description:
                  err instanceof Error ? err.message : 'Please try again.',
              });
            }
          }}
        >
          Continue with Google
        </Button>

        <p className="text-center text-xs text-muted-foreground pt-1">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthFrame>
  );
}

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof forgotSchema>>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = (values: z.infer<typeof forgotSchema>) => {
    toast.success('Password reset instructions sent', {
      description: `Check ${values.email} or sign in directly with a new password on the login page.`,
    });
    navigate('/login');
  };

  return (
    <AuthFrame
      title="Reset your password"
      subtitle="Enter the email registered with your StayAI account."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="forgot-email">Email address</Label>
          <Input
            id="forgot-email"
            type="email"
            placeholder="name@example.com"
            {...register('email')}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>
        <Button type="submit" className="w-full">
          Send Reset Link
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          <Link to="/login" className="text-primary hover:underline">
            Return to sign in
          </Link>
        </p>
      </form>
    </AuthFrame>
  );
}
