'use client'

import Link from 'next/link'
import { ArrowLeft, Settings, Users, Bell, Shield, Database, Mail, Save, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [showApiKey, setShowApiKey] = useState(false)
  const [settings, setSettings] = useState({
    general: {
      companyName: '株式会社サンプル',
      adminEmail: 'admin@sample.com',
      timezone: 'Asia/Tokyo',
      language: 'ja'
    },
    permissions: {
      adminUsers: ['admin@sample.com', 'manager@sample.com'],
      editorUsers: ['editor1@sample.com', 'editor2@sample.com'],
      reviewerUsers: ['reviewer@sample.com']
    },
    notifications: {
      emailEnabled: true,
      pushEnabled: true,
      reminderBeforeDeadline: 48,
      lowResponseRateAlert: 70
    },
    security: {
      requiresAttestation: true,
      sessionTimeout: 480,
      passwordPolicy: 'strong',
      twoFactorAuth: false
    },
    integrations: {
      supabaseUrl: 'https://fvdofdqzfxccbutsyjxh.supabase.co',
      apiKey: '••••••••••••••••••••••••••••••••',
      webhookUrl: ''
    }
  })

  const tabs = [
    { id: 'general', name: '一般設定', icon: Settings },
    { id: 'permissions', name: '権限管理', icon: Users },
    { id: 'notifications', name: '通知設定', icon: Bell },
    { id: 'security', name: 'セキュリティ', icon: Shield },
    { id: 'integrations', name: '統合設定', icon: Database }
  ]

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }))
  }

  const addUser = (section: 'adminUsers' | 'editorUsers' | 'reviewerUsers') => {
    const email = prompt(`新しい${section === 'adminUsers' ? '管理者' : section === 'editorUsers' ? '編集者' : 'レビュアー'}のメールアドレスを入力してください:`)
    if (email && email.includes('@')) {
      setSettings(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [section]: [...prev.permissions[section], email]
        }
      }))
    }
  }

  const removeUser = (section: 'adminUsers' | 'editorUsers' | 'reviewerUsers', email: string) => {
    setSettings(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [section]: prev.permissions[section].filter(user => user !== email)
      }
    }))
  }

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">会社名</label>
        <input
          type="text"
          value={settings.general.companyName}
          onChange={(e) => updateSetting('general', 'companyName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">管理者メールアドレス</label>
        <input
          type="email"
          value={settings.general.adminEmail}
          onChange={(e) => updateSetting('general', 'adminEmail', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">タイムゾーン</label>
        <select
          value={settings.general.timezone}
          onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
          <option value="UTC">UTC</option>
          <option value="America/New_York">America/New_York (EST)</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">言語</label>
        <select
          value={settings.general.language}
          onChange={(e) => updateSetting('general', 'language', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ja">日本語</option>
          <option value="en">English</option>
        </select>
      </div>
    </div>
  )

  const renderPermissions = () => (
    <div className="space-y-8">
      {/* Admin Users */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">管理者</h3>
          <button
            onClick={() => addUser('adminUsers')}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            追加
          </button>
        </div>
        <div className="space-y-2">
          {settings.permissions.adminUsers.map((email) => (
            <div key={email} className="flex items-center justify-between p-3 border rounded-lg">
              <span>{email}</span>
              <button
                onClick={() => removeUser('adminUsers', email)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                削除
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Editor Users */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">編集者</h3>
          <button
            onClick={() => addUser('editorUsers')}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
          >
            追加
          </button>
        </div>
        <div className="space-y-2">
          {settings.permissions.editorUsers.map((email) => (
            <div key={email} className="flex items-center justify-between p-3 border rounded-lg">
              <span>{email}</span>
              <button
                onClick={() => removeUser('editorUsers', email)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                削除
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Reviewer Users */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">レビュアー</h3>
          <button
            onClick={() => addUser('reviewerUsers')}
            className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            追加
          </button>
        </div>
        <div className="space-y-2">
          {settings.permissions.reviewerUsers.map((email) => (
            <div key={email} className="flex items-center justify-between p-3 border rounded-lg">
              <span>{email}</span>
              <button
                onClick={() => removeUser('reviewerUsers', email)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                削除
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-gray-900">メール通知</div>
          <div className="text-sm text-gray-600">システムからのメール通知を送信する</div>
        </div>
        <input
          type="checkbox"
          checked={settings.notifications.emailEnabled}
          onChange={(e) => updateSetting('notifications', 'emailEnabled', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-gray-900">プッシュ通知</div>
          <div className="text-sm text-gray-600">モバイルアプリでのプッシュ通知</div>
        </div>
        <input
          type="checkbox"
          checked={settings.notifications.pushEnabled}
          onChange={(e) => updateSetting('notifications', 'pushEnabled', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          期限前リマインダー（時間）
        </label>
        <input
          type="number"
          value={settings.notifications.reminderBeforeDeadline}
          onChange={(e) => updateSetting('notifications', 'reminderBeforeDeadline', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          低回答率アラート閾値（%）
        </label>
        <input
          type="number"
          value={settings.notifications.lowResponseRateAlert}
          onChange={(e) => updateSetting('notifications', 'lowResponseRateAlert', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  )

  const renderSecurity = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-gray-900">デフォルトアテステーション</div>
          <div className="text-sm text-gray-600">新しいPolicyクイズにアテステーションを必須とする</div>
        </div>
        <input
          type="checkbox"
          checked={settings.security.requiresAttestation}
          onChange={(e) => updateSetting('security', 'requiresAttestation', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          セッションタイムアウト（分）
        </label>
        <input
          type="number"
          value={settings.security.sessionTimeout}
          onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">パスワードポリシー</label>
        <select
          value={settings.security.passwordPolicy}
          onChange={(e) => updateSetting('security', 'passwordPolicy', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="basic">基本（6文字以上）</option>
          <option value="strong">強力（8文字以上、大小英数記号）</option>
          <option value="enterprise">企業レベル（12文字以上、複雑性要求）</option>
        </select>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-gray-900">二要素認証</div>
          <div className="text-sm text-gray-600">管理者ユーザーに二要素認証を要求する</div>
        </div>
        <input
          type="checkbox"
          checked={settings.security.twoFactorAuth}
          onChange={(e) => updateSetting('security', 'twoFactorAuth', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      </div>
    </div>
  )

  const renderIntegrations = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Supabase URL</label>
        <input
          type="text"
          value={settings.integrations.supabaseUrl}
          onChange={(e) => updateSetting('integrations', 'supabaseUrl', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://your-project.supabase.co"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
        <div className="relative">
          <input
            type={showApiKey ? "text" : "password"}
            value={settings.integrations.apiKey}
            onChange={(e) => updateSetting('integrations', 'apiKey', e.target.value)}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL（オプション）</label>
        <input
          type="url"
          value={settings.integrations.webhookUrl}
          onChange={(e) => updateSetting('integrations', 'webhookUrl', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://your-webhook-url.com/endpoint"
        />
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <Mail className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
          <div>
            <div className="font-medium text-yellow-800">統合設定の注意</div>
            <div className="text-sm text-yellow-700 mt-1">
              API Keyや機密情報は安全に管理してください。本番環境では環境変数を使用することを推奨します。
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            メインメニューに戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">設定</h1>
          <p className="text-gray-600 mt-2">権限管理、通知設定、システム管理</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                          activeTab === tab.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        {tab.name}
                      </button>
                    )
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  {tabs.find(tab => tab.id === activeTab)?.name}
                </h2>
              </div>
              
              <div className="p-6">
                {activeTab === 'general' && renderGeneralSettings()}
                {activeTab === 'permissions' && renderPermissions()}
                {activeTab === 'notifications' && renderNotifications()}
                {activeTab === 'security' && renderSecurity()}
                {activeTab === 'integrations' && renderIntegrations()}
              </div>
              
              <div className="p-6 border-t bg-gray-50 flex justify-end">
                <button className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  設定を保存
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}