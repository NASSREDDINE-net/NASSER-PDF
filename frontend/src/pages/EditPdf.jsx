import { useEffect, useRef, useState } from 'react'
import FileDrop from '../components/FileDrop.jsx'
import { loadPdfForRendering, renderPageToDataUrl } from '../lib/pdfRender.js'
import { getPdfPageCount } from '../lib/pdfEdit.js'
import { applyAnnotations } from '../lib/pdfEditApply.js'
import { downloadBlob } from '../lib/imagePdf.js'

const MAX_FILE_MB = 75

const TOOLS = [
  { id: 'select', label: 'تحديد' },
  { id: 'text', label: 'نص' },
  { id: 'image', label: 'صورة' },
  { id: 'rect', label: 'مستطيل' },
  { id: 'ellipse', label: 'دائرة' },
  { id: 'draw', label: 'رسم حر' },
  { id: 'signature', label: 'توقيع' },
  { id: 'highlight', label: 'تظليل' },
  { id: 'whiteout', label: 'إخفاء' }
]

const DRAG_BOX_TOOLS = new Set(['rect', 'ellipse', 'highlight', 'whiteout'])
const PATH_TOOLS = new Set(['draw', 'signature'])

let uidCounter = 0
const nextId = () => `a${++uidCounter}`

function pathBounds(points) {
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  return { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) }
}

export default function EditPdf() {
  const [file, setFile] = useState(null)
  const [pageCount, setPageCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [currentRender, setCurrentRender] = useState(null)
  const [annotations, setAnnotations] = useState({})
  const [tool, setTool] = useState('select')
  const [color, setColor] = useState('#dc2626')
  const [strokeWidth, setStrokeWidth] = useState(3)
  const [selectedId, setSelectedId] = useState(null)
  const [editingTextId, setEditingTextId] = useState(null)
  const [draft, setDraft] = useState(null)
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(false)
  const [error, setError] = useState('')

  const pdfDocRef = useRef(null)
  const pageRendersRef = useRef({})
  const containerRef = useRef(null)
  const draftRef = useRef(null)
  const dragRef = useRef(null)
  const imageInputRef = useRef(null)
  const pendingImagePos = useRef(null)

  const currentAnnotations = annotations[currentPage] || []

  const updateAnnotations = (page, updater) => {
    setAnnotations((prev) => ({ ...prev, [page]: updater(prev[page] || []) }))
  }

  const handleFiles = async (files) => {
    const picked = files[0]
    setError('')
    if (picked.type !== 'application/pdf') {
      setError('صيغة غير مدعومة. يُسمح فقط بملفات PDF.')
      return
    }
    if (picked.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`حجم الملف أكبر من ${MAX_FILE_MB}MB.`)
      return
    }
    try {
      const count = await getPdfPageCount(picked)
      const pdfDoc = await loadPdfForRendering(picked)
      pdfDocRef.current = pdfDoc
      pageRendersRef.current = {}
      setFile(picked)
      setPageCount(count)
      setAnnotations({})
      setSelectedId(null)
      setCurrentPage(1)
      await goToPage(1, pdfDoc)
    } catch (err) {
      console.error(err)
      setError('تعذّر قراءة الملف. تأكد أنه PDF صالح وغير محمي بكلمة مرور.')
    }
  }

  const goToPage = async (pageNumber, pdfDocOverride) => {
    const pdfDoc = pdfDocOverride || pdfDocRef.current
    if (!pdfDoc) return
    setCurrentPage(pageNumber)
    setSelectedId(null)
    if (pageRendersRef.current[pageNumber]) {
      setCurrentRender(pageRendersRef.current[pageNumber])
      return
    }
    setPageLoading(true)
    try {
      const rendered = await renderPageToDataUrl(pdfDoc, pageNumber)
      pageRendersRef.current[pageNumber] = rendered
      setCurrentRender(rendered)
    } catch (err) {
      console.error(err)
      setError('تعذّر عرض هذه الصفحة.')
    } finally {
      setPageLoading(false)
    }
  }

  const localPoint = (e) => {
    const rect = containerRef.current.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const handleContainerPointerDown = (e) => {
    if (!currentRender) return
    const { x, y } = localPoint(e)

    if (tool === 'select') {
      setSelectedId(null)
      return
    }
    if (tool === 'text') {
      const id = nextId()
      updateAnnotations(currentPage, (list) => [
        ...list,
        { id, type: 'text', x, y, width: 180, height: 30, text: '', color }
      ])
      setSelectedId(id)
      setEditingTextId(id)
      return
    }
    if (tool === 'image') {
      pendingImagePos.current = { x, y }
      imageInputRef.current?.click()
      return
    }
    if (DRAG_BOX_TOOLS.has(tool)) {
      draftRef.current = { kind: 'box', x0: x, y0: y, x, y }
      setDraft({ ...draftRef.current })
      return
    }
    if (PATH_TOOLS.has(tool)) {
      draftRef.current = { kind: 'path', points: [{ x, y }] }
      setDraft({ ...draftRef.current })
    }
  }

  useEffect(() => {
    const handleMove = (e) => {
      if (dragRef.current) {
        const d = dragRef.current
        const dx = e.clientX - d.startClientX
        const dy = e.clientY - d.startClientY
        updateAnnotations(currentPage, (list) =>
          list.map((ann) => {
            if (ann.id !== d.id) return ann
            if (ann.type === 'path') {
              return { ...ann, points: d.origPoints.map((p) => ({ x: p.x + dx, y: p.y + dy })) }
            }
            return { ...ann, x: d.origX + dx, y: d.origY + dy }
          })
        )
        return
      }
      if (draftRef.current && containerRef.current) {
        const { x, y } = localPoint(e)
        if (draftRef.current.kind === 'box') {
          draftRef.current = { ...draftRef.current, x, y }
        } else {
          draftRef.current.points.push({ x, y })
        }
        setDraft({ ...draftRef.current })
      }
    }

    const handleUp = () => {
      if (dragRef.current) {
        dragRef.current = null
        return
      }
      if (draftRef.current) {
        const d = draftRef.current
        if (d.kind === 'box') {
          const x = Math.min(d.x0, d.x)
          const y = Math.min(d.y0, d.y)
          const width = Math.abs(d.x - d.x0)
          const height = Math.abs(d.y - d.y0)
          if (width > 6 && height > 6) {
            updateAnnotations(currentPage, (list) => [
              ...list,
              { id: nextId(), type: tool, x, y, width, height, color, strokeWidth }
            ])
          }
        } else if (d.points.length > 3) {
          updateAnnotations(currentPage, (list) => [
            ...list,
            { id: nextId(), type: 'path', kind: tool, points: d.points, color, strokeWidth: tool === 'signature' ? Math.max(strokeWidth, 2) : strokeWidth }
          ])
        }
        draftRef.current = null
        setDraft(null)
      }
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, tool, color, strokeWidth])

  const startDrag = (e, ann) => {
    if (tool !== 'select') return
    e.stopPropagation()
    setSelectedId(ann.id)
    dragRef.current = {
      id: ann.id,
      startClientX: e.clientX,
      startClientY: e.clientY,
      origX: ann.x,
      origY: ann.y,
      origPoints: ann.type === 'path' ? ann.points.map((p) => ({ ...p })) : null
    }
  }

  const handleImageChosen = (e) => {
    const inputFile = e.target.files?.[0]
    e.target.value = ''
    if (!inputFile || !pendingImagePos.current) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      const img = new Image()
      img.onload = () => {
        const maxW = 220
        const ratio = img.naturalHeight / img.naturalWidth
        const width = Math.min(maxW, img.naturalWidth)
        const height = width * ratio
        const { x, y } = pendingImagePos.current
        updateAnnotations(currentPage, (list) => [
          ...list,
          { id: nextId(), type: 'image', x: x - width / 2, y: y - height / 2, width, height, dataUrl }
        ])
        pendingImagePos.current = null
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(inputFile)
  }

  const deleteAnnotation = (id) => {
    updateAnnotations(currentPage, (list) => list.filter((a) => a.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const handleSave = async () => {
    setLoading(true)
    setError('')
    try {
      const blob = await applyAnnotations(file, annotations, pageRendersRef.current)
      downloadBlob(blob, 'nasser-pdf-edited.pdf')
    } catch (err) {
      console.error(err)
      setError('تعذّر حفظ التعديلات. حاول مجدداً.')
    } finally {
      setLoading(false)
    }
  }

  const totalAnnotationsCount = Object.values(annotations).reduce((sum, list) => sum + list.length, 0)

  return (
    <div className="tool-page" style={{ maxWidth: 900 }}>
      <h1>تحرير PDF</h1>
      <p className="lead">أضف نص، صور، أشكال، رسم حر، تظليل، إخفاء، أو توقيع مباشرة فوق صفحات ملف PDF.</p>

      {error && <div className="alert alert-error">{error}</div>}

      {!file && (
        <div className="card">
          <FileDrop accept="application/pdf" onFiles={handleFiles} hint={`PDF فقط — حتى ${MAX_FILE_MB}MB`} />
        </div>
      )}

      {file && (
        <>
          <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            {TOOLS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={tool === t.id ? 'btn' : 'btn btn-secondary'}
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                onClick={() => {
                  setTool(t.id)
                  setSelectedId(null)
                }}
              >
                {t.label}
              </button>
            ))}
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginInlineStart: 'auto' }}>
              <label style={{ fontSize: '0.85rem' }}>اللون</label>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
              <label style={{ fontSize: '0.85rem' }}>السُمك</label>
              <input
                type="range"
                min="1"
                max="10"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                style={{ width: 80 }}
              />
            </span>
          </div>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/png,image/jpeg"
            style={{ display: 'none' }}
            onChange={handleImageChosen}
          />

          <div className="card" style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              ref={containerRef}
              onPointerDown={handleContainerPointerDown}
              style={{
                position: 'relative',
                width: currentRender?.width || 780,
                height: currentRender?.height || 1000,
                background: '#f3f4f6',
                cursor: tool === 'select' ? 'default' : 'crosshair',
                touchAction: 'none',
                userSelect: 'none'
              }}
            >
              {pageLoading && <p style={{ padding: 20 }}>جارٍ تحميل الصفحة...</p>}
              {currentRender && (
                <img
                  src={currentRender.dataUrl}
                  alt={`صفحة ${currentPage}`}
                  width={currentRender.width}
                  height={currentRender.height}
                  style={{ display: 'block', pointerEvents: 'none' }}
                  draggable={false}
                />
              )}

              <svg
                width={currentRender?.width || 0}
                height={currentRender?.height || 0}
                style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
              >
                {currentAnnotations
                  .filter((a) => ['rect', 'ellipse', 'highlight', 'whiteout', 'path'].includes(a.type))
                  .map((a) => {
                    const interactive = tool === 'select'
                    const commonProps = {
                      key: a.id,
                      onPointerDown: (e) => startDrag(e, a),
                      style: { pointerEvents: interactive ? 'auto' : 'none', cursor: interactive ? 'move' : 'default' },
                      stroke: selectedId === a.id ? '#2563eb' : undefined,
                      strokeDasharray: selectedId === a.id ? '4 2' : undefined
                    }
                    if (a.type === 'rect') {
                      return (
                        <rect
                          {...commonProps}
                          x={a.x}
                          y={a.y}
                          width={a.width}
                          height={a.height}
                          fill="none"
                          stroke={selectedId === a.id ? '#2563eb' : a.color}
                          strokeWidth={a.strokeWidth || 2}
                        />
                      )
                    }
                    if (a.type === 'ellipse') {
                      return (
                        <ellipse
                          {...commonProps}
                          cx={a.x + a.width / 2}
                          cy={a.y + a.height / 2}
                          rx={a.width / 2}
                          ry={a.height / 2}
                          fill="none"
                          stroke={selectedId === a.id ? '#2563eb' : a.color}
                          strokeWidth={a.strokeWidth || 2}
                        />
                      )
                    }
                    if (a.type === 'highlight' || a.type === 'whiteout') {
                      return (
                        <rect
                          {...commonProps}
                          x={a.x}
                          y={a.y}
                          width={a.width}
                          height={a.height}
                          fill={a.type === 'whiteout' ? '#ffffff' : a.color || '#ffeb3b'}
                          fillOpacity={a.type === 'whiteout' ? 1 : 0.35}
                          stroke={selectedId === a.id ? '#2563eb' : 'none'}
                        />
                      )
                    }
                    if (a.type === 'path') {
                      return (
                        <polyline
                          {...commonProps}
                          points={a.points.map((p) => `${p.x},${p.y}`).join(' ')}
                          fill="none"
                          stroke={selectedId === a.id ? '#2563eb' : a.color}
                          strokeWidth={a.strokeWidth || 3}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )
                    }
                    return null
                  })}

                {draft && draft.kind === 'box' && (
                  <rect
                    x={Math.min(draft.x0, draft.x)}
                    y={Math.min(draft.y0, draft.y)}
                    width={Math.abs(draft.x - draft.x0)}
                    height={Math.abs(draft.y - draft.y0)}
                    fill="none"
                    stroke={color}
                    strokeDasharray="4 2"
                  />
                )}
                {draft && draft.kind === 'path' && (
                  <polyline
                    points={draft.points.map((p) => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </svg>

              {currentAnnotations
                .filter((a) => a.type === 'text')
                .map((a) =>
                  editingTextId === a.id ? (
                    <textarea
                      key={a.id}
                      autoFocus
                      value={a.text}
                      onChange={(e) =>
                        updateAnnotations(currentPage, (list) =>
                          list.map((item) => (item.id === a.id ? { ...item, text: e.target.value } : item))
                        )
                      }
                      onBlur={() => setEditingTextId(null)}
                      style={{
                        position: 'absolute',
                        left: a.x,
                        top: a.y,
                        width: a.width,
                        height: a.height,
                        color: a.color,
                        border: '1px dashed #2563eb',
                        background: 'rgba(255,255,255,0.85)',
                        font: '600 18px Cairo, sans-serif',
                        resize: 'both'
                      }}
                    />
                  ) : (
                    <div
                      key={a.id}
                      onPointerDown={(e) => startDrag(e, a)}
                      onDoubleClick={() => tool === 'select' && setEditingTextId(a.id)}
                      style={{
                        position: 'absolute',
                        left: a.x,
                        top: a.y,
                        width: a.width,
                        minHeight: a.height,
                        color: a.color,
                        font: '600 18px Cairo, sans-serif',
                        whiteSpace: 'pre-wrap',
                        cursor: tool === 'select' ? 'move' : 'default',
                        outline: selectedId === a.id ? '1px dashed #2563eb' : 'none',
                        pointerEvents: tool === 'select' ? 'auto' : 'none'
                      }}
                    >
                      {a.text || 'نص جديد'}
                    </div>
                  )
                )}

              {currentAnnotations
                .filter((a) => a.type === 'image')
                .map((a) => (
                  <img
                    key={a.id}
                    src={a.dataUrl}
                    alt=""
                    onPointerDown={(e) => startDrag(e, a)}
                    style={{
                      position: 'absolute',
                      left: a.x,
                      top: a.y,
                      width: a.width,
                      height: a.height,
                      outline: selectedId === a.id ? '2px dashed #2563eb' : 'none',
                      cursor: tool === 'select' ? 'move' : 'default',
                      pointerEvents: tool === 'select' ? 'auto' : 'none'
                    }}
                    draggable={false}
                  />
                ))}

              {selectedId && tool === 'select' && (
                <button
                  type="button"
                  onClick={() => deleteAnnotation(selectedId)}
                  style={{
                    position: 'absolute',
                    ...deleteButtonPosition(currentAnnotations.find((a) => a.id === selectedId)),
                    background: '#dc2626',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: 22,
                    height: 22,
                    lineHeight: '22px',
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="btn btn-secondary" disabled={currentPage <= 1} onClick={() => goToPage(currentPage - 1)}>
                السابق
              </button>
              <span>صفحة {currentPage} من {pageCount}</span>
              <button className="btn btn-secondary" disabled={currentPage >= pageCount} onClick={() => goToPage(currentPage + 1)}>
                التالي
              </button>
            </div>
            <button className="btn" disabled={loading || totalAnnotationsCount === 0} onClick={handleSave}>
              {loading && <span className="spinner" />}
              {loading ? 'جارٍ الحفظ...' : 'حفظ وتنزيل PDF'}
            </button>
          </div>
          <p className="hint">
            نصيحة: استخدم أداة "تحديد" لتحريك أو حذف أي عنصر أضفته، وانقر مرتين فوق نص لتعديله.
          </p>
        </>
      )}
    </div>
  )
}

function deleteButtonPosition(ann) {
  if (!ann) return { display: 'none' }
  if (ann.type === 'path') {
    const b = pathBounds(ann.points)
    return { left: b.x + b.width - 10, top: b.y - 12 }
  }
  return { left: ann.x + ann.width - 10, top: ann.y - 12 }
}
