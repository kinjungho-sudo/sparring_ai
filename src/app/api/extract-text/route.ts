import { NextRequest, NextResponse } from 'next/server'

const MAX_BYTES = 5 * 1024 * 1024 // 5MB
const MAX_CHARS = 8000

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 })

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: '파일 크기는 5MB 이하여야 합니다.' }, { status: 413 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  const buffer = Buffer.from(await file.arrayBuffer())

  try {
    let text = ''

    if (ext === 'txt') {
      text = buffer.toString('utf-8')
    } else if (ext === 'pdf') {
      // pdf-parse exports differ between CJS/ESM builds
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mod = await import('pdf-parse') as any
      const pdfParse = mod.default ?? mod
      const result = await pdfParse(buffer)
      text = result.text
    } else if (ext === 'docx') {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    } else {
      return NextResponse.json({ error: 'PDF, DOCX, TXT만 지원합니다.' }, { status: 415 })
    }

    // 공백 정리 및 길이 제한
    text = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
    if (text.length > MAX_CHARS) {
      text = text.slice(0, MAX_CHARS) + `\n\n...(${file.name} 전체 내용 중 앞부분만 포함됨)`
    }

    return NextResponse.json({ text })
  } catch (e) {
    console.error('[extract-text]', e)
    return NextResponse.json({ error: '파일 파싱 오류' }, { status: 500 })
  }
}
