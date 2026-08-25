import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import Layout from './components/Layout.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import Home from './pages/Home.jsx'

const WordToPdf = lazy(() => import('./pages/WordToPdf.jsx'))
const ExcelToPdf = lazy(() => import('./pages/ExcelToPdf.jsx'))
const ImageToPdf = lazy(() => import('./pages/ImageToPdf.jsx'))
const QrCode = lazy(() => import('./pages/QrCode.jsx'))
const PdfEditor = lazy(() => import('./pages/PdfEditor.jsx'))
const MergePdf = lazy(() => import('./pages/MergePdf.jsx'))
const SplitPdf = lazy(() => import('./pages/SplitPdf.jsx'))
const OrganizePdf = lazy(() => import('./pages/OrganizePdf.jsx'))
const WatermarkPdf = lazy(() => import('./pages/WatermarkPdf.jsx'))
const EditPdf = lazy(() => import('./pages/EditPdf.jsx'))
const PdfToImage = lazy(() => import('./pages/PdfToImage.jsx'))
const ExtractText = lazy(() => import('./pages/ExtractText.jsx'))
const FillPdfForm = lazy(() => import('./pages/FillPdfForm.jsx'))
const PdfToWord = lazy(() => import('./pages/PdfToWord.jsx'))
const PdfToExcel = lazy(() => import('./pages/PdfToExcel.jsx'))
const CompressPdf = lazy(() => import('./pages/CompressPdf.jsx'))
const ProtectPdf = lazy(() => import('./pages/ProtectPdf.jsx'))
const ComparePdf = lazy(() => import('./pages/ComparePdf.jsx'))
const OcrTool = lazy(() => import('./pages/OcrTool.jsx'))
const Privacy = lazy(() => import('./pages/Privacy.jsx'))
const Terms = lazy(() => import('./pages/Terms.jsx'))
const About = lazy(() => import('./pages/About.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

function PageLoading() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <span className="spinner" style={{ borderTopColor: '#dc2626', borderColor: '#fee2e2' }} />
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <Layout>
        <Suspense fallback={<PageLoading />}>
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
            <Route path="/pdf-to-image" element={<PdfToImage />} />
            <Route path="/extract-text" element={<ExtractText />} />
            <Route path="/fill-pdf-form" element={<FillPdfForm />} />
            <Route path="/pdf-to-word" element={<PdfToWord />} />
            <Route path="/pdf-to-excel" element={<PdfToExcel />} />
            <Route path="/compress-pdf" element={<CompressPdf />} />
            <Route path="/protect-pdf" element={<ProtectPdf />} />
            <Route path="/compare-pdf" element={<ComparePdf />} />
            <Route path="/ocr" element={<OcrTool />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
      <Analytics />
    </ErrorBoundary>
  )
}
