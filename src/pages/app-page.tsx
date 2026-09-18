import { useParams } from 'react-router-dom'
import { getApp } from '@/apps/registry'
import { ToolShell } from '@/components/common/tool-shell'
import { NotFoundPage } from './not-found-page'

export function AppPage() {
  const { id } = useParams<{ id: string }>()
  const app = id ? getApp(id) : undefined

  if (!app) return <NotFoundPage />

  const { Component } = app
  return (
    <ToolShell app={app}>
      <Component />
    </ToolShell>
  )
}
