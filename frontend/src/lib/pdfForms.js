import { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown, PDFRadioGroup, PDFOptionList } from 'pdf-lib'

export async function loadFormFields(file) {
  const bytes = await file.arrayBuffer()
  const doc = await PDFDocument.load(bytes)
  const form = doc.getForm()
  const fields = form.getFields().map((field) => {
    const name = field.getName()
    if (field instanceof PDFTextField) {
      return { name, type: 'text', value: field.getText() || '' }
    }
    if (field instanceof PDFCheckBox) {
      return { name, type: 'checkbox', value: field.isChecked() }
    }
    if (field instanceof PDFDropdown) {
      return { name, type: 'dropdown', options: field.getOptions(), value: field.getSelected()[0] || '' }
    }
    if (field instanceof PDFRadioGroup) {
      return { name, type: 'radio', options: field.getOptions(), value: field.getSelected() || '' }
    }
    if (field instanceof PDFOptionList) {
      return { name, type: 'optionlist', options: field.getOptions(), value: field.getSelected() || [] }
    }
    return { name, type: 'unsupported', value: null }
  })
  return fields
}

export async function fillForm(file, values) {
  const bytes = await file.arrayBuffer()
  const doc = await PDFDocument.load(bytes)
  const form = doc.getForm()
  const fields = form.getFields()

  for (const field of fields) {
    const name = field.getName()
    if (!(name in values)) continue
    const value = values[name]

    if (field instanceof PDFTextField) {
      field.setText(value || '')
    } else if (field instanceof PDFCheckBox) {
      if (value) field.check()
      else field.uncheck()
    } else if (field instanceof PDFDropdown || field instanceof PDFRadioGroup) {
      if (value) field.select(value)
    } else if (field instanceof PDFOptionList) {
      if (Array.isArray(value) && value.length > 0) field.select(value)
    }
  }

  const outBytes = await doc.save()
  return new Blob([outBytes], { type: 'application/pdf' })
}
