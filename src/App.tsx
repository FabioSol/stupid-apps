import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { PageShell } from '@/components/layout/page-shell'
import { Toaster } from '@/components/ui/sonner'
import { AppPage } from '@/pages/app-page'
import { LandingPage } from '@/pages/landing-page'
import { NotFoundPage } from '@/pages/not-found-page'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <PageShell>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/:id" element={<AppPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </PageShell>
      <Toaster />
    </BrowserRouter>
  )
}
