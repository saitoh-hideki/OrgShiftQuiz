'use client'

import Link from 'next/link'
import { BarChart3, BookOpen, MessageSquare, Settings, Users } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function HomePage() {
  const [systemStats, setSystemStats] = useState({
    activeQuizzes: 0,
    avgResponseRate: 0,
    pendingApproval: 0,
    criticalItems: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSystemStats = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/dashboard?company_id=00000000-0000-0000-0000-000000000001')
        
        if (!response.ok) {
          throw new Error('システム状態の取得に失敗しました')
        }
        
        const data = await response.json()
        
        if (data.success && data.data) {
          setSystemStats({
            activeQuizzes: data.data.stats.activeQuizzes || 0,
            avgResponseRate: data.data.stats.avgResponseRate || 0,
            pendingApproval: data.data.stats.pendingApproval || 0,
            criticalItems: data.data.stats.criticalItems || 0
          })
        }
      } catch (err) {
        console.error('システム状態取得エラー:', err)
        setError(err instanceof Error ? err.message : 'データの取得に失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSystemStats()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            OrgShift Quiz 管理システム
          </h1>
          <p className="text-xl text-gray-600">
            組織の方針・ニュース・マニュアルをクイズ形式で効果的に配信
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* コンテンツハブ */}
          <Link href="/content-hub" className="group">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold">コンテンツハブ</h3>
              </div>
              <p className="text-gray-600 mb-4">
                News・Policy・Manualの管理とAIクイズ生成
              </p>
              <div className="text-blue-600 group-hover:text-blue-800 font-medium">
                管理を開始 →
              </div>
            </div>
          </Link>

          {/* 配信ビルダー */}
          <Link href="/dispatch-builder" className="group">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <MessageSquare className="h-8 w-8 text-green-600 mr-3" />
                <h3 className="text-xl font-semibold">配信ビルダー</h3>
              </div>
              <p className="text-gray-600 mb-4">
                クイズの束ね、セグメント設定、配信管理
              </p>
              <div className="text-green-600 group-hover:text-green-800 font-medium">
                配信作成 →
              </div>
            </div>
          </Link>

          {/* ダッシュボード */}
          <Link href="/dashboard" className="group">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <BarChart3 className="h-8 w-8 text-purple-600 mr-3" />
                <h3 className="text-xl font-semibold">ダッシュボード</h3>
              </div>
              <p className="text-gray-600 mb-4">
                配信状況、回答率、正答率の分析
              </p>
              <div className="text-purple-600 group-hover:text-purple-800 font-medium">
                分析表示 →
              </div>
            </div>
          </Link>

          {/* クイズ管理 */}
          <Link href="/quizzes" className="group">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <Users className="h-8 w-8 text-orange-600 mr-3" />
                <h3 className="text-xl font-semibold">クイズ管理</h3>
              </div>
              <p className="text-gray-600 mb-4">
                配信済みクイズの一覧と詳細分析
              </p>
              <div className="text-orange-600 group-hover:text-orange-800 font-medium">
                一覧表示 →
              </div>
            </div>
          </Link>

          {/* 分析 */}
          <Link href="/analytics" className="group">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <BarChart3 className="h-8 w-8 text-red-600 mr-3" />
                <h3 className="text-xl font-semibold">詳細分析</h3>
              </div>
              <p className="text-gray-600 mb-4">
                誤答分析、再出題、理解度レポート
              </p>
              <div className="text-red-600 group-hover:text-red-800 font-medium">
                分析開始 →
              </div>
            </div>
          </Link>

          {/* 設定 */}
          <Link href="/settings" className="group">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <Settings className="h-8 w-8 text-gray-600 mr-3" />
                <h3 className="text-xl font-semibold">設定</h3>
              </div>
              <p className="text-gray-600 mb-4">
                権限管理、通知設定、システム管理
              </p>
              <div className="text-gray-600 group-hover:text-gray-800 font-medium">
                設定変更 →
              </div>
            </div>
          </Link>
        </div>

        {/* システム状態表示 */}
        <div className="mt-12 bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">システム状態</h3>
          {isLoading ? (
            <div className="text-center py-4">
              <div className="text-gray-500">読み込み中...</div>
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <div className="text-red-500 text-sm">{error}</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{systemStats.activeQuizzes}</div>
                <div className="text-sm text-gray-600">配信中</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{systemStats.avgResponseRate}%</div>
                <div className="text-sm text-gray-600">平均回答率</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{systemStats.pendingApproval}</div>
                <div className="text-sm text-gray-600">承認待ち</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{systemStats.criticalItems}</div>
                <div className="text-sm text-gray-600">要注意項目</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
