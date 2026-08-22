import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import Home from './pages/Home.jsx'
import WordToPdf from './pages/WordToPdf.jsx'
import ExcelToPdf from './pages/ExcelToPdf.jsx'
import ImageToPdf from './pages/ImageToPdf.jsx'
import QrCode from './pages/QrCode.jsx'
import PdfEditor from './pages/PdfEditor.jsx'
import MergePdf from './pages/MergePdf.jsx'
import SplitPdf from './pages/SplitPdf.jsx'
import OrganizePdf from './pages/OrganizePdf.jsx'
import WatermarkPdf from './pages/WatermarkPdf.jsx'
import EditPdf from './pages/EditPdf.jsx'
import Privacy from './pages/Privacy.jsx'
import Terms from './pages/Terms.jsx'
import About from './pages/About.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <ErrorBoundary>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/word-to-pdf" element={<WordToPdf />} />
          <Route path="/excel-to-pdf" element={<ExcelToPdf />} />
          <Route path="/image-to-pdf" element={<ImageToPdf />} />
          <Route path="/qr-code" element={<QrCode />} />
          <Route path="/pdf-editor" element={<PdfEditor />} />
          <Route path="/merge-pdf" element={<MergePdf />} />
          <Route path="/split-pdf" element={<SplitPdf />} />
          <Route path="/organize-pdf" element={<OrganizePdf />} />
          <Route path="/watermark-pdf" element={<WatermarkPdf />} />
          <Route path="/edit-pdf" element={<EditPdf />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </ErrorBoundary>
  )
}
