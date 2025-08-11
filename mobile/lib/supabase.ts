import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Disable auto refresh for mobile to improve battery life
    autoRefreshToken: false,
    // Keep session in memory only for better security
    persistSession: false,
  },
})

// Quiz data types
export interface Quiz {
  id: string
  title: string
  description?: string
  source_type: 'news' | 'policy' | 'manual'
  questions: Question[]
  deadline?: string
  requires_attestation: boolean
  created_at: string
}

export interface Question {
  id: string
  quiz_id: string
  question_text: string
  options: string[]
  correct_answer: string
  explanation?: string
  citation_url?: string
}

export interface Response {
  id: string
  quiz_id: string
  user_id: string
  answers: ResponseItem[]
  score: number
  completed_at: string
}

export interface ResponseItem {
  question_id: string
  selected_answer: string
  is_correct: boolean
}