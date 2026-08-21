import { useRef, useState } from 'react'

export default function FileDrop({ accept, multiple = false, onFiles, hint }) {
  const inputRef = useRef(null)
  const [active, setActive] = useState(false)

  const handleFiles = (fileList) => {
    const files = Array.from(fileList || [])
    if (files.length > 0) onFiles(files)
  }

  return (
    <div
      className={`dropzone${active ? ' active' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setActive(true)
      }}
      onDragLeave={() => setActive(false)}
      onDrop={(e) => {
        e.preventDefault()
        setActive(false)
        handleFiles(e.dataTransfer.files)
      }}
      role="button"
      tabIndex={0}
    >
      <p>اسحب الملف هنا أو اضغط للاختيار</p>
      {hint && <p className="hint">{hint}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          handleFiles(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}
