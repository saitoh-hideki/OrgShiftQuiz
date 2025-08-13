'use client'

import Link from 'next/link'
import { BarChart3, BookOpen, MessageSquare, Settings, Users, Clock, AlertTriangle } from 'lucide-react'
import { useState, useEffect } from 'react'
import CoolHeader from '@/components/CoolHeader'

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

  // スポットライト効果のためのマウス位置追跡
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll('.spotlight')
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        
        ;(card as HTMLElement).style.setProperty('--mouse-x', `${x}px`)
        ;(card as HTMLElement).style.setProperty('--mouse-y', `${y}px`)
      })
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen bg-[#F0F4FA] p-8">
      <div className="max-w-7xl mx-auto">
        {/* 🚀 強化されたヘッダー - ブランドグラデーション（仕様書完全準拠） */}
        <CoolHeader
          title="OrgShift Quiz — Main Menu"
          subtitle="組織学習を加速させるクイズ配信システム"
          showBackButton={false}
          className="header-gradient-cool header-bottom-shadow text-center mb-16"
        />

        {/* 🚀 強化されたメインカードグリッド（青系統一） */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* コンテンツハブ */}
          <Link href="/content-hub" className="group">
            <div className="card-enhanced rounded-2xl p-8 hover-lift border spotlight-enhanced focus-ring-blue animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-2xl icon-bg-content flex items-center justify-center mr-4 shadow-soft transition-all duration-200 group-hover:icon-bg-unified-hover">
                  <BookOpen className="h-6 w-6 text-[#2563EB]" />
                </div>
                <h3 className="text-lg font-semibold text-heading-strong tracking-tight">コンテンツハブ</h3>
              </div>
              <p className="text-body-strong mb-6 leading-relaxed">
                News・Policy・Manualの管理とAIクイズ生成
              </p>
              <div className="text-brand-primary group-hover:text-brand-secondary font-medium transition-colors duration-200">
                管理を開始 →
              </div>
            </div>
          </Link>

          {/* 配信ビルダー */}
          <Link href="/dispatch-builder" className="group">
            <div className="card-enhanced rounded-2xl p-8 hover-lift border spotlight-enhanced focus-ring-blue animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-2xl icon-bg-quiz flex items-center justify-center mr-4 shadow-soft transition-all duration-200 group-hover:icon-bg-unified-hover">
                  <MessageSquare className="h-6 w-6 text-[#10B981]" />
                </div>
                <h3 className="text-lg font-semibold text-heading-strong tracking-tight">配信ビルダー</h3>
              </div>
              <p className="text-body-strong mb-6 leading-relaxed">
                クイズを束ねて配信スケジュールを設定
              </p>
              <div className="text-[#10B981] group-hover:text-[#059669] font-medium transition-colors duration-200">
                配信作成 →
              </div>
            </div>
          </Link>

          {/* クイズ管理 */}
          <Link href="/quizzes" className="group">
            <div className="card-enhanced rounded-2xl p-8 hover-lift border spotlight-enhanced focus-ring-blue animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-2xl icon-bg-dashboard flex items-center justify-center mr-4 shadow-soft transition-all duration-200 group-hover:icon-bg-unified-hover">
                  <BarChart3 className="h-6 w-6 text-[#8B5CF6]" />
                </div>
                <h3 className="text-lg font-semibold text-heading-strong tracking-tight">クイズ管理</h3>
              </div>
              <p className="text-body-strong mb-6 leading-relaxed">
                配信済みクイズの詳細分析と管理
              </p>
              <div className="text-[#8B5CF6] group-hover:text-[#7C3AED] font-medium transition-colors duration-200">
                一覧表示 →
              </div>
            </div>
          </Link>

          {/* 詳細分析 */}
          <Link href="/analytics" className="group">
            <div className="card-enhanced rounded-2xl p-8 hover-lift border spotlight-enhanced focus-ring-blue animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-2xl icon-bg-analytics flex items-center justify-center mr-4 shadow-soft transition-all duration-200 group-hover:icon-bg-unified-hover">
                  <BarChart3 className="h-6 w-6 text-[#EF4444]" />
                </div>
                <h3 className="text-lg font-semibold text-heading-strong tracking-tight">詳細分析</h3>
              </div>
              <p className="text-body-strong mb-6 leading-relaxed">
                詳細な分析レポートとインサイト
              </p>
              <div className="text-[#EF4444] group-hover:text-[#DC2626] font-medium transition-colors duration-200">
                分析開始 →
              </div>
            </div>
          </Link>

          {/* 設定 */}
          <Link href="/settings" className="group">
            <div className="card-enhanced rounded-2xl p-8 hover-lift border spotlight-enhanced focus-ring-blue animate-fade-in-up" style={{animationDelay: '0.5s'}}>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-2xl icon-bg-settings flex items-center justify-center mr-4 shadow-soft transition-all duration-200 group-hover:icon-bg-unified-hover">
                  <Settings className="h-6 w-6 text-[#64748B]" />
                </div>
                <h3 className="text-lg font-semibold text-heading-strong tracking-tight">設定</h3>
              </div>
              <p className="text-body-strong mb-6 leading-relaxed">
                システム設定とユーザー管理
              </p>
              <div className="text-[#64748B] group-hover:text-[#475569] font-medium transition-colors duration-200">
                設定変更 →
              </div>
            </div>
          </Link>

          {/* ダッシュボード */}
          <Link href="/dashboard" className="group">
            <div className="card-enhanced rounded-2xl p-8 hover-lift border spotlight-enhanced focus-ring-blue animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-2xl icon-bg-dashboard flex items-center justify-center mr-4 shadow-soft transition-all duration-200 group-hover:icon-bg-unified-hover">
                  <BarChart3 className="h-6 w-6 text-[#2563EB]" />
                </div>
                <h3 className="text-lg font-semibold text-heading-strong tracking-tight">ダッシュボード</h3>
              </div>
              <p className="text-body-strong mb-6 leading-relaxed">
                システム全体の状況とKPI
              </p>
              <div className="text-brand-primary group-hover:text-brand-secondary font-medium transition-colors duration-200">
                詳細表示 →
              </div>
            </div>
          </Link>
        </div>

        {/* 🚀 強化されたシステム状況（KPI色分け・青系背景） */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            <div className="kpi-enhanced kpi-active rounded-2xl p-6 shadow-soft border animate-fade-in-up" style={{animationDelay: '0.7s'}}>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-2xl icon-bg-content flex items-center justify-center mr-4 shadow-soft">
                  <BarChart3 className="h-5 w-5 text-[#2563EB]" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-heading-strong">{systemStats.activeQuizzes}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide">配信中</div>
                </div>
              </div>
            </div>
            
            <div className="kpi-enhanced kpi-response-rate rounded-2xl p-6 shadow-soft border animate-fade-in-up" style={{animationDelay: '0.8s'}}>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-2xl icon-bg-quiz flex items-center justify-center mr-4 shadow-soft">
                  <Users className="h-5 w-5 text-[#10B981]" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-heading-strong">{systemStats.avgResponseRate}%</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide">平均回答率</div>
                </div>
              </div>
            </div>
            
            <div className="kpi-enhanced kpi-pending rounded-2xl p-6 shadow-soft border animate-fade-in-up" style={{animationDelay: '0.9s'}}>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-2xl icon-bg-management flex items-center justify-center mr-4 shadow-soft">
                  <Clock className="h-5 w-5 text-[#F59E0B]" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-heading-strong">{systemStats.pendingApproval}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide">承認待ち</div>
                </div>
              </div>
            </div>
            
            <div className="kpi-enhanced kpi-critical rounded-2xl p-6 shadow-soft border animate-fade-in-up" style={{animationDelay: '1.0s'}}>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-2xl icon-bg-analytics flex items-center justify-center mr-4 shadow-soft">
                  <AlertTriangle className="h-5 w-5 text-[#EF4444]" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-heading-strong">{systemStats.criticalItems}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide">要注意項目</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🚀 強化されたエラー表示（青系テーマ） */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center animate-fade-in-up" style={{animationDelay: '1.1s'}}>
            <div className="text-red-800 font-medium mb-2">システム状態の取得に失敗しました</div>
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}

        {/* 🚀 強化されたローディング表示（青系テーマ） */}
        {isLoading && (
          <div className="text-center py-12 animate-fade-in-up" style={{animationDelay: '1.2s'}}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB] mx-auto mb-4"></div>
            <div className="text-caption-strong">システム状態を取得中...</div>
          </div>
        )}
      </div>
    </div>
  )
}
