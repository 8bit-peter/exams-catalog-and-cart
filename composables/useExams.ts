export interface Exam {
  id: string
  name: string
  category: string
  price: number
  fastingRequired: boolean
  resultTimeHours: number
  popularity: number
  tags: string[]
}

export const useExams = async (): Promise<Exam[]> => {
  const exams = useState<Exam[]>('exams', () => [])
  
  // Only fetch if not already loaded
  if (exams.value.length === 0) {
    // Use API route for SSR compatibility
    const data = await $fetch<Exam[]>('/api/exams')
    exams.value = data
  }
  
  return exams.value
}

