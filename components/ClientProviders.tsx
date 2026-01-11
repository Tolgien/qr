
'use client'

import PageLoadingIndicator from './PageLoadingIndicator'

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageLoadingIndicator />
      {children}
    </>
  )
}
