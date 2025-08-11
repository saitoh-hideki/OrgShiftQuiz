'use client'

import Link from 'next/link'
import { ArrowLeft, Newspaper, FileText, BookOpen, Plus, Clock, CheckCircle, AlertCircle } from 'lucide-react'

export default function ContentHubPage() {
  const mockContent = {
    news: [
      {
        id: 1,
        title: '教育デジタル化推進法の施行について',
        source: 'NHK NEWS WEB',
        publishedAt: '2025-08-10',
        status: 'draft',
        quizGenerated: false
      },
      {
        id: 2,
        title: '自治体DX推進計画の改訂版公開',
        source: '総務省',
        publishedAt: '2025-08-09',
        status: 'approved',
        quizGenerated: true
      }
    ],
    policies: [
      {
        id: 1,
        title: '情報セキュリティ基本方針 v2.1',
        version: 'v2.1',
        effectiveDate: '2025-09-01',
        status: 'pending_approval',
        requiresAttestation: true
      },
      {
        id: 2,
        title: 'リモートワーク規程',
        version: 'v1.3',
        effectiveDate: '2025-08-15',
        status: 'active',
        requiresAttestation: false
      }
    ],
    manuals: [
      {
        id: 1,
        title: 'システム利用マニュアル',
        category: 'IT',
        questions: 8,
        status: 'active'
      },
      {
        id: 2,
        title: '新人研修FAQ',
        category: 'HR',
        questions: 12,
        status: 'draft'
      }
    ]
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">配信中</span>
      case 'draft':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">下書き</span>
      case 'approved':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">承認済み</span>
      case 'pending_approval':
        return <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">承認待ち</span>
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{status}</span>
    }
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
          <h1 className="text-3xl font-bold text-gray-900">コンテンツハブ</h1>
          <p className="text-gray-600 mt-2">News・Policy・Manualの管理とAIクイズ生成</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* News Section */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Newspaper className="h-6 w-6 text-blue-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">News</h2>
                </div>
                <button className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">
                  <Plus className="h-4 w-4 mr-1" />
                  RSS追加
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockContent.news.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight">{item.title}</h3>
                      {getStatusBadge(item.status)}
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{item.source} • {item.publishedAt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs">
                        {item.quizGenerated ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            クイズ生成済み
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            クイズ未生成
                          </div>
                        )}
                      </div>
                      <button className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100">
                        詳細
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Policy Section */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-6 w-6 text-green-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Policy</h2>
                </div>
                <button className="flex items-center px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100">
                  <Plus className="h-4 w-4 mr-1" />
                  文書追加
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockContent.policies.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight">{item.title}</h3>
                      {getStatusBadge(item.status)}
                    </div>
                    <div className="flex items-center text-xs text-gray-600 mb-3">
                      <span>{item.version}</span>
                      <span className="mx-2">•</span>
                      <span>施行日: {item.effectiveDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs">
                        {item.requiresAttestation ? (
                          <div className="flex items-center text-red-600">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            同意必須
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            同意不要
                          </div>
                        )}
                      </div>
                      <button className="px-3 py-1 text-xs font-medium text-green-600 bg-green-50 rounded hover:bg-green-100">
                        詳細
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Manual Section */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BookOpen className="h-6 w-6 text-orange-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Manual</h2>
                </div>
                <button className="flex items-center px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100">
                  <Plus className="h-4 w-4 mr-1" />
                  手入力
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockContent.manuals.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight">{item.title}</h3>
                      {getStatusBadge(item.status)}
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{item.category} • {item.questions}問</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {item.questions}問作成済み
                      </div>
                      <button className="px-3 py-1 text-xs font-medium text-orange-600 bg-orange-50 rounded hover:bg-orange-100">
                        編集
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-2">承認待ちコンテンツ</h3>
            <div className="text-2xl font-bold text-orange-600">3</div>
            <p className="text-sm text-gray-600">Policy: 1件, News: 2件</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-2">今月の生成クイズ</h3>
            <div className="text-2xl font-bold text-blue-600">24</div>
            <p className="text-sm text-gray-600">自動生成: 18件, 手動: 6件</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-2">配信待ちTray</h3>
            <div className="text-2xl font-bold text-green-600">8</div>
            <p className="text-sm text-gray-600">承認済み、配信可能</p>
          </div>
        </div>
      </div>
    </div>
  )
}