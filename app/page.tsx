import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default async function Home() {
  // Check if user is already authenticated
  const session = await getSession()

  if (session) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }
}
