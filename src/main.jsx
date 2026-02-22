import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/components/auth/AuthContext'
import Layout from '@/Layout'
import Home from '@/pages/Home'
import Welcome from '@/pages/Welcome'
import PageNotFound from '@/lib/PageNotFound'
import '@/globals.css'

import AnimatedShorts from '@/pages/AnimatedShorts'
import MyMedia from '@/pages/MyMedia'
import MyCharacters from '@/pages/MyCharacters'
import MyDrafts from '@/pages/MyDrafts'
import AdminPanel from '@/pages/AdminPanel'
import Optimizer from '@/pages/Optimizer'
import VideoProjects from '@/pages/VideoProjects'
import Create3DModel from '@/pages/Create3DModel'
import MyComics from '@/pages/MyComics'
import VoiceLibrary from '@/pages/VoiceLibrary'
import CreateComic from '@/pages/CreateComic'
import ComicViewer from '@/pages/ComicViewer'
import CoverGenerator from '@/pages/CoverGenerator'
import VideoStudio from '@/pages/VideoStudio'

function AppLayout({ children, currentPageName }) {
  return <Layout currentPageName={currentPageName}>{children}</Layout>
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/home" element={<AppLayout currentPageName="Home"><Home /></AppLayout>} />
          <Route path="/optimizer" element={<AppLayout currentPageName="Optimizer"><Optimizer /></AppLayout>} />
          <Route path="/cover-generator" element={<AppLayout currentPageName="CoverGenerator"><CoverGenerator /></AppLayout>} />
          <Route path="/animated-shorts" element={<AppLayout currentPageName="AnimatedShorts"><AnimatedShorts /></AppLayout>} />
          <Route path="/video-projects" element={<AppLayout currentPageName="VideoProjects"><VideoProjects /></AppLayout>} />
          <Route path="/voice-library" element={<AppLayout currentPageName="VoiceLibrary"><VoiceLibrary /></AppLayout>} />
          <Route path="/my-comics" element={<AppLayout currentPageName="MyComics"><MyComics /></AppLayout>} />
          <Route path="/my-characters" element={<AppLayout currentPageName="MyCharacters"><MyCharacters /></AppLayout>} />
          <Route path="/my-media" element={<AppLayout currentPageName="MyMedia"><MyMedia /></AppLayout>} />
          <Route path="/my-drafts" element={<AppLayout currentPageName="MyDrafts"><MyDrafts /></AppLayout>} />
          <Route path="/admin-panel" element={<AppLayout currentPageName="AdminPanel"><AdminPanel /></AppLayout>} />
          <Route path="/create-comic" element={<AppLayout currentPageName="CreateComic"><CreateComic /></AppLayout>} />
          <Route path="/comic-viewer/:id" element={<AppLayout currentPageName="ComicViewer"><ComicViewer /></AppLayout>} />
          <Route path="/create-3d-model" element={<AppLayout currentPageName="Create3DModel"><Create3DModel /></AppLayout>} />
          <Route path="/video-studio" element={<AppLayout currentPageName="VideoStudio"><VideoStudio /></AppLayout>} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)