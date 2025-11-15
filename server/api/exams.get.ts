import { readFile } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  try {
    const filePath = join(process.cwd(), 'public', 'exams.json')
    const fileContents = await readFile(filePath, 'utf-8')
    const exams = JSON.parse(fileContents)
    return exams
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load exams data'
    })
  }
})

