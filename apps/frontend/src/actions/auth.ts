'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type AuthState = { error?: string } | undefined

export async function signupAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: { data: { name: formData.get('name') as string } },
  })
  if (error) return { error: error.message }
  redirect('/dashboard')
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error) return { error: error.message }
  redirect('/dashboard')
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/dashboard')
  redirect('/login')
}

export async function guestAction(): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: 'demo@gmail.com',
    password: 'Test@123',
  })
  if (error) throw new Error(error.message)
  redirect('/dashboard')
}
