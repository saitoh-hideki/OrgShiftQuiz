'use client'

import Link from 'next/link'
import { ArrowLeft, BarChart3, Users, Clock, AlertTriangle, TrendingUp, FileText } from 'lucide-react'

export default function DashboardPage() {
  const mockStats = {
    totalQuizzes: 12,
    activeQuizzes: 8,
    avgResponseRate: 85,
    pendingApproval: 3,
    criticalItems: 2,
    totalUsers: 156,
    completedToday: 42
  }

  const mockQuizzes = [
    {
      id: 1,
      title: '教育デジタル化推進法について',
      source: 'News',
      responseRate: 92,
      avgScore: 78,
      deadline: '2025-08-15',
      status: 'active'
    },
    {
      id: 2,
      title: '情報セキュリティ基本方針 v2.0',
      source: 'Policy',
      responseRate: 67,
      avgScore: 85,
      deadline: '2025-08-20',
      status: 'active',
      requiresAttestation: true
    },
    {
      id: 3,
      title: 'リモートワーク FAQ',
      source: 'Manual',
      responseRate: 88,
      avgScore: 91,
      deadline: '2025-08-25',
      status: 'completed'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            メインメニューに戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="text-gray-600 mt-2">配信状況と回答分析の概要</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{mockStats.activeQuizzes}</div>
                <div className="text-sm text-gray-600">配信中のクイズ</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{mockStats.avgResponseRate}%</div>
                <div className="text-sm text-gray-600">平均回答率</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{mockStats.pendingApproval}</div>
                <div className="text-sm text-gray-600">承認待ち</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{mockStats.criticalItems}</div>
                <div className="text-sm text-gray-600">要注意項目</div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Quizzes */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">配信中のクイズ</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {mockQuizzes.map((quiz) => (
                <div key={quiz.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <h3 className="font-semibold text-gray-900 mr-3">{quiz.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        quiz.source === 'News' ? 'bg-blue-100 text-blue-800' :
                        quiz.source === 'Policy' ? 'bg-green-100 text-green-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {quiz.source}
                      </span>
                      {quiz.requiresAttestation && (
                        <span className="ml-2 text-xs text-red-600 font-medium">🔒 同意必須</span>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      quiz.status === 'active' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {quiz.status === 'active' ? '配信中' : '完了'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">回答率: </span>
                      <span className={`font-medium ${
                        quiz.responseRate >= 80 ? 'text-green-600' :
                        quiz.responseRate >= 60 ? 'text-orange-600' :
                        'text-red-600'
                      }`}>
                        {quiz.responseRate}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">平均スコア: </span>
                      <span className={`font-medium ${
                        quiz.avgScore >= 80 ? 'text-green-600' :
                        quiz.avgScore >= 60 ? 'text-orange-600' :
                        'text-red-600'
                      }`}>
                        {quiz.avgScore}点
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">期限: </span>
                      <span className="font-medium">{quiz.deadline}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/content-hub" className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <FileText className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="font-semibold">新しいコンテンツ</h3>
            </div>
            <p className="text-gray-600 text-sm">News・Policy・Manualから新しいクイズを作成</p>
          </Link>
          
          <Link href="/dispatch-builder" className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-6 w-6 text-green-600 mr-3" />
              <h3 className="font-semibold">配信作成</h3>
            </div>
            <p className="text-gray-600 text-sm">クイズを束ねて配信スケジュールを設定</p>
          </Link>
          
          <Link href="/analytics" className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <BarChart3 className="h-6 w-6 text-purple-600 mr-3" />
              <h3 className="font-semibold">詳細分析</h3>
            </div>
            <p className="text-gray-600 text-sm">誤答分析と理解度の詳細レポート</p>
          </Link>
        </div>
      </div>
    </div>
  )
}