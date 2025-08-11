'use client'

import Link from 'next/link'
import { ArrowLeft, TrendingUp, TrendingDown, AlertTriangle, RefreshCw, Download, Filter, BarChart3 } from 'lucide-react'
import { useState } from 'react'

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            メインメニューに戻る
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">詳細分析</h1>
              <p className="text-gray-600 mt-2">誤答分析、再出題、理解度レポート</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7">過去7日</option>
                <option value="30">過去30日</option>
                <option value="90">過去90日</option>
              </select>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Download className="h-4 w-4 mr-2" />
                レポート出力
              </button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{mockAnalytics.summary.totalResponses}</div>
                <div className="text-sm text-gray-600">総回答数</div>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{mockAnalytics.summary.avgResponseRate}%</div>
                <div className="text-sm text-gray-600">平均回答率</div>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{mockAnalytics.summary.avgScore}点</div>
                <div className="text-sm text-gray-600">平均スコア</div>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">{mockAnalytics.summary.criticalItems}</div>
                <div className="text-sm text-gray-600">要注意項目</div>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Wrong Answers Analysis */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">誤答率の高い問題</h2>
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  すべて表示
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockAnalytics.wrongAnswers.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 mr-4">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">
                          {item.question}
                        </h3>
                        <p className="text-xs text-gray-600 mb-2">{item.quizTitle}</p>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.source === 'News' ? 'bg-blue-100 text-blue-800' :
                          item.source === 'Policy' ? 'bg-green-100 text-green-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {item.source}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-red-600">{item.wrongRate}%</div>
                        <div className="text-xs text-gray-500">{item.wrongAnswers}/{item.totalAnswers}人</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-xs text-gray-600 mb-1">よくある誤答:</div>
                      <div className="flex flex-wrap gap-1">
                        {item.commonMistakes.map((mistake, idx) => (
                          <span key={idx} className="px-2 py-1 text-xs bg-red-50 text-red-700 rounded">
                            {mistake}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="text-xs">
                          {item.reissueScheduled ? (
                            <span className="flex items-center text-orange-600">
                              <RefreshCw className="h-3 w-3 mr-1" />
                              再出題予定
                            </span>
                          ) : (
                            <span className="text-gray-500">再出題なし</span>
                          )}
                        </div>
                        <button className="text-xs text-blue-600 hover:text-blue-800">
                          詳細分析
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance by Source */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">ソース別パフォーマンス</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockAnalytics.performanceBySource.map((item) => (
                  <div key={item.source} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full mr-3 ${
                          item.source === 'News' ? 'bg-blue-100 text-blue-800' :
                          item.source === 'Policy' ? 'bg-green-100 text-green-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {item.source}
                        </span>
                        <span className="text-sm text-gray-600">{item.quizzes}件のクイズ</span>
                      </div>
                      {getTrendIcon(item.trend)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">平均スコア</div>
                        <div className={`font-semibold ${getScoreColor(item.avgScore)}`}>
                          {item.avgScore}点
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">回答率</div>
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

        {/* Department Performance */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">部門別パフォーマンス</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">部門</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">メンバー数</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">回答率</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">平均スコア</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">要注意項目</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockAnalytics.departmentPerformance.map((dept) => (
                  <tr key={dept.department} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{dept.department}</td>
                    <td className="px-6 py-4 text-gray-600">{dept.members}名</td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${getResponseRateColor(dept.responseRate)}`}>
                        {dept.responseRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${getScoreColor(dept.avgScore)}`}>
                        {dept.avgScore}点
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {dept.criticalItems > 0 ? (
                        <span className="flex items-center text-red-600">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          {dept.criticalItems}件
                        </span>
                      ) : (
                        <span className="text-green-600">なし</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Trends */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">週別トレンド</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {mockAnalytics.recentTrends.map((trend) => (
                <div key={trend.period} className="text-center">
                  <div className="text-sm text-gray-600 mb-2">{trend.period}</div>
                  <div className="space-y-2">
                    <div>
                      <div className="text-lg font-bold text-blue-600">{trend.responses}</div>
                      <div className="text-xs text-gray-500">回答数</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">{trend.avgScore}点</div>
                      <div className="text-xs text-gray-500">平均スコア</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-orange-600">{trend.responseRate}%</div>
                      <div className="text-xs text-gray-500">回答率</div>
                    </div>
                    <div className="text-xs font-medium text-gray-700">
                      前週比: {trend.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}