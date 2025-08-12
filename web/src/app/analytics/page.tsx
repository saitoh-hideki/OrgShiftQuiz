'use client'

import { TrendingUp, TrendingDown, Filter, RefreshCw, Download, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30')
  const [sourceFilter, setSourceFilter] = useState('all')

  const mockAnalytics = {
    summary: {
      totalQuizzes: 24,
      totalResponses: 1247,
      avgResponseRate: 78,
      avgScore: 84,
      improvementRate: 12,
      criticalItems: 5
    },
    wrongAnswers: [
      {
        id: 1,
        question: '教育デジタル化推進法の施行日はいつですか？',
        quizTitle: '教育デジタル化推進法について',
        source: 'News',
        totalAnswers: 142,
        wrongAnswers: 67,
        wrongRate: 47,
        commonMistakes: ['2025年4月1日', '2024年4月1日'],
        reissueScheduled: true
      },
      {
        id: 2,
        question: '情報セキュリティインシデント発生時の第一報告先は？',
        quizTitle: '情報セキュリティ基本方針 v2.1',
        source: 'Policy',
        totalAnswers: 89,
        wrongAnswers: 34,
        wrongRate: 38,
        commonMistakes: ['直属の上司', '総務部'],
        reissueScheduled: false
      },
      {
        id: 3,
        question: 'VPN接続時の認証方法として正しいものは？',
        quizTitle: 'システム利用マニュアル',
        source: 'Manual',
        totalAnswers: 156,
        wrongAnswers: 52,
        wrongRate: 33,
        commonMistakes: ['パスワードのみ', 'IDカードタッチ'],
        reissueScheduled: true
      }
    ],
    performanceBySource: [
      { source: 'News', quizzes: 8, avgScore: 76, responseRate: 85, trend: 'up' },
      { source: 'Policy', quizzes: 10, avgScore: 88, responseRate: 72, trend: 'down' },
      { source: 'Manual', quizzes: 6, avgScore: 91, responseRate: 94, trend: 'up' }
    ],
    recentTrends: [
      { period: '今週', responses: 342, avgScore: 86, responseRate: 82, change: '+5%' },
      { period: '先週', responses: 298, avgScore: 81, responseRate: 78, change: '+2%' },
      { period: '2週前', responses: 287, avgScore: 79, responseRate: 76, change: '-1%' },
      { period: '3週前', responses: 320, avgScore: 80, responseRate: 77, change: '+3%' }
    ],
    departmentPerformance: [
      { department: 'IT部門', members: 32, responseRate: 94, avgScore: 89, criticalItems: 1 },
      { department: '営業部', members: 45, responseRate: 78, avgScore: 82, criticalItems: 2 },
      { department: '人事部', members: 18, responseRate: 89, avgScore: 91, criticalItems: 0 },
      { department: '総務部', members: 23, responseRate: 71, avgScore: 78, criticalItems: 3 },
      { department: '管理職', members: 25, responseRate: 88, avgScore: 86, criticalItems: 1 }
    ]
  }

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600'
    if (score >= 70) return 'text-orange-600'
    return 'text-red-600'
  }

  const getResponseRateColor = (rate: number) => {
    if (rate >= 85) return 'text-green-600'
    if (rate >= 70) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-[#F0F4FA] p-6">
      <div className="max-w-7xl mx-auto">
        {/* 🚀 強化されたヘッダー - ブランドグラデーション */}
        <div className="brand-header mb-12 p-8 rounded-[24px] pattern-dots relative overflow-hidden">
          <Link href="/" className="inline-flex items-center gradient-text-blue-subtitle hover:text-white mb-6 transition-colors duration-200 group">
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            メインメニューに戻る
          </Link>
          <div className="relative z-10 animate-fade-in-up">
            <h1 className="text-[32px] font-bold gradient-text-blue-light mb-3 tracking-[-0.5%] drop-shadow-sm">
              詳細分析
            </h1>
            <p className="text-[14px] gradient-text-blue-subtitle leading-[1.6]">
              クイズの詳細な分析レポートとインサイト
            </p>
          </div>
        </div>

        {/* 🚀 強化されたフィルター */}
        <div className="card-enhanced rounded-[20px] shadow-soft border p-6 mb-8 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-[#64748B]" />
              <span className="text-sm font-medium text-[#374151]">期間:</span>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-1 text-sm border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-[#0F172A]"
              >
                <option value="7">過去7日</option>
                <option value="30">過去30日</option>
                <option value="90">過去90日</option>
                <option value="365">過去1年</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-[#374151]">ソース:</span>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="px-3 py-1 text-sm border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-[#0F172A]"
              >
                <option value="all">すべて</option>
                <option value="news">News</option>
                <option value="policy">Policy</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            
            <button className="flex items-center px-3 py-1 text-sm text-[#2563EB] bg-[#EFF6FF] rounded-lg hover:bg-[#DBEAFE] transition-colors duration-200">
              <RefreshCw className="h-4 w-4 mr-1" />
              更新
            </button>
            
            <button className="flex items-center px-3 py-1 text-sm text-[#10B981] bg-[#ECFDF5] rounded-lg hover:bg-[#D1FAE5] transition-colors duration-200">
              <Download className="h-4 w-4 mr-1" />
              エクスポート
            </button>
          </div>
        </div>

        {/* 🚀 強化されたサマリー統計 */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <div className="card-enhanced rounded-[20px] p-6 shadow-soft border animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#0F172A] mb-1">{mockAnalytics.summary.totalQuizzes}</div>
              <div className="text-sm text-[#64748B]">総クイズ数</div>
            </div>
          </div>
          
          <div className="card-enhanced rounded-[20px] p-6 shadow-soft border animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#0F172A] mb-1">{mockAnalytics.summary.totalResponses}</div>
              <div className="text-sm text-[#64748B]">総回答数</div>
            </div>
          </div>
          
          <div className="card-enhanced rounded-[20px] p-6 shadow-soft border animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#10B981] mb-1">{mockAnalytics.summary.avgResponseRate}%</div>
              <div className="text-sm text-[#64748B]">平均回答率</div>
            </div>
          </div>
          
          <div className="card-enhanced rounded-[20px] p-6 shadow-soft border animate-fade-in-up" style={{animationDelay: '0.5s'}}>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#2563EB] mb-1">{mockAnalytics.summary.avgScore}点</div>
              <div className="text-sm text-[#64748B]">平均スコア</div>
            </div>
          </div>
          
          <div className="card-enhanced rounded-[20px] p-6 shadow-soft border animate-fade-in-up" style={{animationDelay: '0.6s'}}>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#F59E0B] mb-1">+{mockAnalytics.summary.improvementRate}%</div>
              <div className="text-sm text-[#64748B]">改善率</div>
            </div>
          </div>
          
          <div className="card-enhanced rounded-[20px] p-6 shadow-soft border animate-fade-in-up" style={{animationDelay: '0.7s'}}>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#EF4444] mb-1">{mockAnalytics.summary.criticalItems}</div>
              <div className="text-sm text-[#64748B]">要注意項目</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 🚀 強化されたWrong Answers Analysis */}
          <div className="card-enhanced rounded-[20px] shadow-soft border animate-fade-in-up" style={{animationDelay: '0.8s'}}>
            <div className="p-6 border-b border-[rgba(37,99,235,0.08)]">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#0F172A]">誤答率の高い問題</h2>
                <button className="text-sm text-[#2563EB] hover:text-[#1D4ED8] transition-colors duration-200">
                  すべて表示
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockAnalytics.wrongAnswers.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="bg-white border border-[rgba(37,99,235,0.08)] rounded-[16px] p-4 shadow-soft hover:shadow-hover transition-all duration-200 animate-fade-in-up"
                    style={{animationDelay: `${0.9 + index * 0.1}s`}}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 mr-4">
                        <h3 className="font-semibold text-[#0F172A] text-sm mb-1">
                          {item.question}
                        </h3>
                        <p className="text-xs text-[#64748B] mb-2">{item.quizTitle}</p>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.source === 'News' ? 'bg-[#EFF6FF] text-[#1E40AF]' :
                          item.source === 'Policy' ? 'bg-[#ECFDF5] text-[#065F46]' :
                          'bg-[#FFFBEB] text-[#92400E]'
                        }`}>
                          {item.source}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-[#EF4444]">{item.wrongRate}%</div>
                        <div className="text-xs text-[#64748B]">{item.wrongAnswers}/{item.totalAnswers}人</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-[rgba(37,99,235,0.08)]">
                      <div className="text-xs text-[#64748B] mb-1">よくある誤答:</div>
                      <div className="flex flex-wrap gap-1">
                        {item.commonMistakes.map((mistake, idx) => (
                          <span key={idx} className="px-2 py-1 text-xs bg-[#FEF2F2] text-[#DC2626] rounded-[8px]">
                            {mistake}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="text-xs">
                          {item.reissueScheduled ? (
                            <span className="flex items-center text-[#F59E0B]">
                              <RefreshCw className="h-3 w-3 mr-1" />
                              再出題予定
                            </span>
                          ) : (
                            <span className="text-[#64748B]">再出題なし</span>
                          )}
                        </div>
                        <button className="text-xs text-[#2563EB] hover:text-[#1D4ED8] transition-colors duration-200">
                          詳細分析
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 🚀 強化されたPerformance by Source */}
          <div className="card-enhanced rounded-[20px] shadow-soft border animate-fade-in-up" style={{animationDelay: '1.0s'}}>
            <div className="p-6 border-b border-[rgba(37,99,235,0.08)]">
              <h2 className="text-xl font-semibold text-[#0F172A]">ソース別パフォーマンス</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockAnalytics.performanceBySource.map((item, index) => (
                  <div 
                    key={item.source} 
                    className="bg-white border border-[rgba(37,99,235,0.08)] rounded-[16px] p-4 shadow-soft hover:shadow-hover transition-all duration-200 animate-fade-in-up"
                    style={{animationDelay: `${1.1 + index * 0.1}s`}}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full mr-3 ${
                          item.source === 'News' ? 'bg-[#EFF6FF] text-[#1E40AF]' :
                          item.source === 'Policy' ? 'bg-[#ECFDF5] text-[#065F46]' :
                          'bg-[#FFFBEB] text-[#92400E]'
                        }`}>
                          {item.source}
                        </span>
                        <span className="text-sm text-[#64748B]">{item.quizzes}件のクイズ</span>
                      </div>
                      {getTrendIcon(item.trend)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-[#64748B]">平均スコア</div>
                        <div className={`font-semibold ${getScoreColor(item.avgScore)}`}>
                          {item.avgScore}点
                        </div>
                      </div>
                      <div>
                        <div className="text-[#64748B]">回答率</div>
                        <div className={`font-semibold ${getResponseRateColor(item.responseRate)}`}>
                          {item.responseRate}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 🚀 強化されたRecent Trends */}
        <div className="card-enhanced rounded-[20px] shadow-soft border p-6 mb-8 animate-fade-in-up" style={{animationDelay: '1.3s'}}>
          <h2 className="text-xl font-semibold text-[#0F172A] mb-6">最近のトレンド</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {mockAnalytics.recentTrends.map((trend, index) => (
              <div key={trend.period} className="text-center">
                <div className="text-sm text-[#64748B] mb-2">{trend.period}</div>
                <div className="text-2xl font-bold text-[#0F172A] mb-1">{trend.responses}</div>
                <div className="text-sm text-[#64748B] mb-2">回答数</div>
                <div className="text-lg font-semibold text-[#2563EB] mb-1">{trend.avgScore}点</div>
                <div className="text-sm text-[#64748B] mb-2">平均スコア</div>
                <div className="text-lg font-semibold text-[#10B981] mb-1">{trend.responseRate}%</div>
                <div className="text-sm text-[#64748B] mb-2">回答率</div>
                <div className={`text-sm font-medium ${
                  trend.change.startsWith('+') ? 'text-[#10B981]' : 'text-[#EF4444]'
                }`}>
                  {trend.change}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 🚀 強化されたDepartment Performance */}
        <div className="card-enhanced rounded-[20px] shadow-soft border p-6 animate-fade-in-up" style={{animationDelay: '1.4s'}}>
          <h2 className="text-xl font-semibold text-[#0F172A] mb-6">部門別パフォーマンス</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(37,99,235,0.08)]">
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#374151]">部門</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-[#374151]">メンバー数</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-[#374151]">回答率</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-[#374151]">平均スコア</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-[#374151]">要注意項目</th>
                </tr>
              </thead>
              <tbody>
                {mockAnalytics.departmentPerformance.map((dept, index) => (
                  <tr 
                    key={dept.department} 
                    className="border-b border-[rgba(37,99,235,0.08)] hover:bg-[#F8FAFC] transition-colors duration-200 animate-fade-in-up"
                    style={{animationDelay: `${1.5 + index * 0.1}s`}}
                  >
                    <td className="py-3 px-4 text-sm font-medium text-[#0F172A]">{dept.department}</td>
                    <td className="py-3 px-4 text-sm text-center text-[#64748B]">{dept.members}名</td>
                    <td className="py-3 px-4 text-sm text-center">
                      <span className={`font-medium ${getResponseRateColor(dept.responseRate)}`}>
                        {dept.responseRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-center">
                      <span className={`font-medium ${getScoreColor(dept.avgScore)}`}>
                        {dept.avgScore}点
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        dept.criticalItems === 0 ? 'bg-[#ECFDF5] text-[#065F46]' :
                        dept.criticalItems <= 2 ? 'bg-[#FFFBEB] text-[#92400E]' :
                        'bg-[#FEF2F2] text-[#DC2626]'
                      }`}>
                        {dept.criticalItems}件
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}