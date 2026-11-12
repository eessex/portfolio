import type { Metadata } from 'next'
import { cache, Suspense } from 'react'

import {
  fetchEmailSubscriptionsPage,
  parsePageParam
} from '@/lib/email-subscriptions/data'
import { DashboardLayout } from '@/ui/dashboard/dashboard-layout'
import { SubscriberActions } from '@/ui/email-subscriptions/subscriber-actions'
import { Subscribers } from '@/ui/email-subscriptions/subscribers'
import { Loading } from '@/ui/loading'

const title = 'Dashboard: Subscribers'
export const metadata: Metadata = { title }

type SearchParams = Promise<Record<string, string | string[]>>

// one fetch per request for the header actions and the tables
const loadSubscribers = cache(async (searchParams: SearchParams) => {
  const { page, exportedPage, spamPage } = await searchParams
  return fetchEmailSubscriptionsPage({
    page: parsePageParam(page),
    exportedPage: parsePageParam(exportedPage),
    spamPage: parsePageParam(spamPage)
  })
})

export default function SubscribersPage({
  searchParams
}: {
  searchParams: SearchParams
}) {
  return (
    <DashboardLayout
      title={title}
      actions={
        <Suspense>
          <SubscribersActions searchParams={searchParams} />
        </Suspense>
      }
    >
      <Suspense fallback={<Loading />}>
        <SubscribersList searchParams={searchParams} />
      </Suspense>
    </DashboardLayout>
  )
}

// Read searchParams, so they stream in under the static heading
async function SubscribersActions({
  searchParams
}: {
  searchParams: SearchParams
}) {
  const { activeCount, unexportedCount } =
    await loadSubscribers(searchParams)
  return (
    <SubscriberActions
      activeCount={activeCount}
      unexportedCount={unexportedCount}
    />
  )
}

async function SubscribersList({
  searchParams
}: {
  searchParams: SearchParams
}) {
  return <Subscribers data={await loadSubscribers(searchParams)} />
}
