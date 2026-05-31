'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import {
  guestAction,
  loginAction,
  signupAction,
  type AuthState,
} from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type AuthFormProps = {
  mode: 'login' | 'signup'
}

export function AuthForm({ mode }: AuthFormProps) {
  const action = mode === 'login' ? loginAction : signupAction
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    undefined
  )

  const isLogin = mode === 'login'

  return (
    <Card className="w-full max-w-md border-border/60 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {isLogin ? 'Welcome back' : 'Create your account'}
        </CardTitle>
        <CardDescription>
          {isLogin
            ? 'Sign in to manage your workflows'
            : 'Start building pipelines in minutes'}
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="Jane Doe" required />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full mt-3" disabled={pending}>
            {pending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isLogin ? 'Sign in' : 'Create account'}
          </Button>
          <Button
            type="submit"
            formAction={guestAction}
            formNoValidate
            variant="outline"
            className="w-full"
            disabled={pending}
          >
            Continue as guest
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <Link
              href={isLogin ? '/signup' : '/login'}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
