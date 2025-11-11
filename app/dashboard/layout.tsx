import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import DashboardWrapper from '@/components/dashboard/DashboardLayout'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  })

  if (!user) {
    redirect('/login')
  }

  return (
    <>
      <DashboardWrapper user={user}>
        {children}
      </DashboardWrapper>
      <InstallPrompt />
    </>
  )
}

