'use client'

import { ArrowLeft, RefreshCw } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

interface CoolHeaderProps {
  title: string
  subtitle: string
  showBackButton?: boolean
  backHref?: string
  showRefreshButton?: boolean
  onRefresh?: () => void
  refreshing?: boolean
  className?: string
}

export default function CoolHeader({
  title,
  subtitle,
  showBackButton = true,
  backHref = '/',
  showRefreshButton = false,
  onRefresh,
  refreshing = false,
  className = ''
}: CoolHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)

  // デバッグログ
  console.log('CoolHeader rendered with props:', {
    title,
    subtitle,
    showBackButton,
    backHref,
    showRefreshButton
  })

  // 戻るボタンの表示状態をログ出力
  useEffect(() => {
    if (showBackButton) {
      console.log('戻るボタンをレンダリング中...', { showBackButton, backHref })
    } else {
      console.log('戻るボタンは表示されません。showBackButton:', showBackButton)
    }
  }, [showBackButton, backHref])

  // スクロール監視
  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const scrollTop = window.scrollY
        if (scrollTop > 50) {
          setIsScrolled(true)
        } else {
          setIsScrolled(false)
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div 
      ref={headerRef}
      className={`${className.includes('header-gradient-cool') ? 'header-gradient-cool header-bottom-shadow' : 'bg-white border border-gray-200'} rounded-lg mb-8 relative overflow-hidden transition-all duration-300 ${
        isScrolled ? 'py-6' : 'py-8'
      } px-8 ${className}`}
    >
      {/* パターン装飾（グラデーションヘッダーの場合のみ） */}
      {className.includes('header-gradient-cool') && (
        <>
          <div className="header-pattern"></div>
          <div className="header-shine-line"></div>
        </>
      )}
      
      {/* 戻るリンク */}
      {showBackButton ? (
        <>
          <button 
            onClick={() => {
              console.log('戻るボタンがクリックされました')
              console.log('遷移先:', backHref)
              console.log('現在のURL:', window.location.href)
              window.location.href = backHref
            }}
            className={`${className.includes('header-gradient-cool') ? 'header-back-link border-2 border-white border-opacity-50 bg-white bg-opacity-5 hover:border-opacity-80 hover:bg-white hover:bg-opacity-20' : 'border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 hover:text-gray-900'} inline-flex items-center mb-6 transition-all duration-200 group cursor-pointer rounded-lg px-4 py-2`}
            style={{
              minHeight: '44px',
              minWidth: '200px',
              zIndex: 1000
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-4 group-hover:-translate-x-1 transition-transform duration-200" />
            メインメニューに戻る
          </button>
        </>
      ) : (
        null
      )}
      
      {/* メインコンテンツ */}
      <div className="flex items-center justify-between relative z-10">
        <div className={className.includes('header-gradient-cool') ? 'header-fade-in' : ''}>
          <h1 className={`${className.includes('header-gradient-cool') ? 'header-title-cool mb-3' : 'text-2xl font-bold text-gray-900 mb-2'}`}>
            {title}
          </h1>
          <p className={`${className.includes('header-gradient-cool') ? 'header-subtitle-cool' : 'text-gray-600'}`}>
            {subtitle}
          </p>
        </div>
        
        {/* アクションボタン */}
        {showRefreshButton && onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className={`${className.includes('header-gradient-cool') ? 'header-action-button px-6 py-3 rounded-2xl' : 'px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'} inline-flex items-center disabled:opacity-50 transition-all duration-200 font-medium`}
          >
            <RefreshCw className={`${className.includes('header-gradient-cool') ? 'h-5 w-5 mr-3' : 'h-4 w-4 mr-2'} ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? '更新中...' : '更新'}
          </button>
        )}
      </div>
    </div>
  )
}
