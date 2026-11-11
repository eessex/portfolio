import type { Metadata } from 'next'
import { Suspense } from 'react'

import {
  fetchEmailSubscriptionsPage,
  parsePageParam
} from '@/lib/email-subscriptions/data'
import { DashboardLayout } from '@/ui/dashboard/dashboard-layout'
import { Subscribers } from '@/ui/email-subscriptions/subscribers'
import { Loading } from '@/ui/loading'

const title = 'Dashboard: Subscribers'
export const metadata: Metadata = { title }

type SearchParams = Promise<Record<string, string | string[]>>

export default function SubscribersPage({
  searchParams
}: {
  searchParams: SearchParams
}) {
  return (
    <DashboardLayout title={title}>
      <Suspense fallback={<Loading />}>
        <SubscribersList searchParams={searchParams} />
      </Suspense>
    </DashboardLayout>
  )
}

// Reads searchParams, so it streams in under the static heading
async function SubscribersList({
  searchParams
}: {
  searchParams: SearchParams
}) {
  const { page } = await searchParams
  const data = await fetchEmailSubscriptionsPage(parsePageParam(page))
  return <Subscribers data={data} />
}
