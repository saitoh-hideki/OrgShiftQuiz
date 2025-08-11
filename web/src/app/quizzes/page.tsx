'use client'

import Link from 'next/link'
import { ArrowLeft, Search, Filter, Eye, Edit, Trash2, BarChart3, Users, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { useState } from 'react'

export default function QuizzesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')

  const mockQuizzes = [
    {
      id: 1,
      title: '教育デジタル化推進法について',
      source: 'News',
      questions: 3,
      status: 'active',
      created: '2025-08-10',
      deadline: '2025-08-15',
      totalResponses: 142,
      responseRate: 91,
      avgScore: 78,
      difficulty: 'medium'
    },
    {
      id: 2,
      title: '情報セキュリティ基本方針 v2.1',
      source: 'Policy',
      questions: 5,
      status: 'active',
      created: '2025-08-09',
      deadline: '2025-08-20',
      totalResponses: 89,
      responseRate: 57,
      avgScore: 85,
      difficulty: 'hard',
      requiresAttestation: true
    },
    {
      id: 3,
      title: 'システム利用マニュアル',
      source: 'Manual',
      questions: 4,
      status: 'completed',
      created: '2025-08-05',
      deadline: '2025-08-12',
      totalResponses: 156,
      responseRate: 100,
      avgScore: 91,
      difficulty: 'easy'
    },
    {
      id: 4,
      title: 'リモートワーク規程 更新版',
      source: 'Policy',
      questions: 3,
      status: 'draft',
      created: '2025-08-11',
      deadline: '2025-08-25',
      totalResponses: 0,
      responseRate: 0,
      avgScore: 0,
      difficulty: 'medium'
    },
    {
      id: 5,
      title: '自治体DX推進計画の改訂について',
      source: 'News',
      questions: 4,
      status: 'pending_approval',
      created: '2025-08-08',
      deadline: '2025-08-18',
      totalResponses: 0,
      responseRate: 0,
      avgScore: 0,
      difficulty: 'medium'
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full flex items-center"><CheckCircle className="h-3 w-3 mr-1" />配信中</span>
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full flex items-center"><CheckCircle className="h-3 w-3 mr-1" />完了</span>
      case 'draft':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full flex items-center"><Edit className="h-3 w-3 mr-1" />下書き</span>
      case 'pending_approval':
        return <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full flex items-center"><Clock className="h-3 w-3 mr-1" />承認待ち</span>
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{status}</span>
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600'
      case 'medium':
        return 'text-yellow-600'
      case 'hard':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const filteredQuizzes = mockQuizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || quiz.status === statusFilter
    const matchesSource = sourceFilter === 'all' || quiz.source === sourceFilter
    return matchesSearch && matchesStatus && matchesSource
  })

  const stats = {
    total: mockQuizzes.length,
    active: mockQuizzes.filter(q => q.status === 'active').length,
    completed: mockQuizzes.filter(q => q.status === 'completed').length,
    pending: mockQuizzes.filter(q => q.status === 'pending_approval').length
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            メインメニューに戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">クイズ管理</h1>
          <p className="text-gray-600 mt-2">配信済みクイズの一覧と詳細分析</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">総クイズ数</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
                <div className="text-sm text-gray-600">配信中</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
                <div className="text-sm text-gray-600">完了</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
                <div className="text-sm text-gray-600">承認待ち</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="クイズタイトルを検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべてのステータス</option>
              <option value="active">配信中</option>
              <option value="completed">完了</option>
              <option value="draft">下書き</option>
              <option value="pending_approval">承認待ち</option>
            </select>
            
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべてのソース</option>
              <option value="News">News</option>
              <option value="Policy">Policy</option>
              <option value="Manual">Manual</option>
            </select>
          </div>
        </div>

        {/* Quiz List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              クイズ一覧 ({filteredQuizzes.length}件)
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">クイズ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ソース</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">回答状況</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">成績</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">期限</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">アクション</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">{quiz.title}</div>
                        <div className="text-sm text-gray-500">
                          {quiz.questions}問 • 
                          <span className={`ml-1 ${getDifficultyColor(quiz.difficulty)}`}>
                            {quiz.difficulty === 'easy' ? '易' : quiz.difficulty === 'medium' ? '中' : '難'}
                          </span>
                          {quiz.requiresAttestation && (
                            <span className="ml-2 text-xs text-red-600">🔒 同意必須</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        quiz.source === 'News' ? 'bg-blue-100 text-blue-800' :
                        quiz.source === 'Policy' ? 'bg-green-100 text-green-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {quiz.source}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(quiz.status)}
                    </td>
                    <td className="px-6 py-4">
                      {quiz.status === 'active' || quiz.status === 'completed' ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {quiz.totalResponses}人回答
                          </div>
                          <div className={`text-sm ${
                            quiz.responseRate >= 80 ? 'text-green-600' :
                            quiz.responseRate >= 60 ? 'text-orange-600' :
                            'text-red-600'
                          }`}>
                            回答率: {quiz.responseRate}%
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">-</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {quiz.status === 'active' || quiz.status === 'completed' ? (
                        <div>
                          <div className={`text-sm font-medium ${
                            quiz.avgScore >= 80 ? 'text-green-600' :
                            quiz.avgScore >= 60 ? 'text-orange-600' :
                            'text-red-600'
                          }`}>
                            平均: {quiz.avgScore}点
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">-</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{quiz.deadline}</div>
                      <div className="text-xs text-gray-500">作成: {quiz.created}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-blue-600 hover:text-blue-800">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-green-600 hover:text-green-800">
                          <BarChart3 className="h-4 w-4" />
                        </button>
                        {quiz.status === 'draft' && (
                          <>
                            <button className="p-1 text-orange-600 hover:text-orange-800">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-red-600 hover:text-red-800">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredQuizzes.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <div className="text-lg font-medium mb-2">該当するクイズがありません</div>
              <div className="text-sm">検索条件を変更してお試しください</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}