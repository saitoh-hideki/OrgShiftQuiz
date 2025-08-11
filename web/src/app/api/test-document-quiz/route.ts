import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Test API received:', body)
    
    // テスト用のクイズを生成（実際の文書内容に基づく）
    const testQuiz = [
      {
        question: `「${body.documentTitle || 'テスト文書'}」の内容について、最も重要なポイントは何ですか？`,
        options: [
          '文書の具体的な内容を確認する必要がある',
          '一般的なポリシーの原則',
          '法的要件の遵守',
          '組織の運営方針'
        ],
        correct_answer: '文書の具体的な内容を確認する必要がある',
        explanation: 'このクイズは実際の文書内容を読み込んでいないため、具体的な内容に基づいた質問ができません。'
      },
      {
        question: '現在のクイズ生成システムの問題点は？',
        options: [
          '文書の実際のテキスト内容を読み込んでいない',
          'AIの性能が低い',
          'データベースの容量不足',
          'ネットワークの問題'
        ],
        correct_answer: '文書の実際のテキスト内容を読み込んでいない',
        explanation: 'Edge Functionが文書の実際の内容を正しく読み込んでいないため、汎用的なクイズしか生成できません。'
      }
    ]
    
    return NextResponse.json({
      ok: true,
      count: testQuiz.length,
      questions: testQuiz,
      title: 'テスト用クイズ',
      message: 'これはテスト用のクイズです。実際の文書内容は読み込まれていません。',
      debug: {
        receivedData: body,
        hasContentText: false,
        contentLength: 0
      }
    })

  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
