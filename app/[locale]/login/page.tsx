'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useTranslations } from '@/hooks/use-translations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const t = useTranslations(locale)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})
  const [showLangMenu, setShowLangMenu] = useState(false)

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}
    
    if (!email) {
      newErrors.email = t('auth.login.errors.invalidEmail')
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('auth.login.errors.invalidEmail')
    }
    
    if (!password || password.length < 8) {
      newErrors.password = t('auth.login.errors.invalidPassword')
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const getRoleBasePath = (role: string): string => {
    switch (role) {
      case 'OWNER':
        return 'owner'
      case 'ADMIN':
        return 'admin'
      case 'RESIDENT':
        return 'resident'
      default:
        return 'dashboard'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    setErrors({})
    
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        setErrors({ general: t('auth.login.errors.invalidCredentials') })
        setIsLoading(false)
      } else if (result?.ok) {
        // Get session to determine role
        const response = await fetch('/api/auth/session')
        const session = await response.json()
        
        if (session?.user?.role) {
          const roleBase = getRoleBasePath(session.user.role)
          router.replace(`/${locale}/${roleBase}`)
        } else {
          // Fallback: try to redirect based on callbackUrl or default
          router.replace(`/${locale}/dashboard`)
        }
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred' })
      setIsLoading(false)
    }
  }

  const toggleLanguage = (newLocale: string) => {
    router.push(`/${newLocale}/login`)
    setShowLangMenu(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Language Switcher */}
          <div className="absolute top-4 right-4">
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-elevated transition-colors"
              >
                <GlobeIcon className="w-5 h-5 text-text-secondary" />
                <span className="text-sm font-medium text-text-secondary uppercase">{locale}</span>
              </button>
              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-surface rounded-lg shadow-card-hover border border-border py-1 z-50">
                  <button
                    onClick={() => toggleLanguage('fr')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-surface-elevated"
                  >
                    🇫🇷 Français
                  </button>
                  <button
                    onClick={() => toggleLanguage('ar')}
                    className="w-full px-4 py-2 text-right text-sm hover:bg-surface-elevated"
                  >
                    🇲🇦 العربية
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-2xl">د</span>
            </div>
            <div>
              <span className="font-heading font-bold text-2xl text-text-primary">Darency</span>
              <span className="block text-xs text-text-tertiary">{t('common.tagline')}</span>
            </div>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold text-text-primary mb-2">
              {t('auth.login.title')}
            </h1>
            <p className="text-text-secondary">
              {t('auth.login.subtitle')}
            </p>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
              {errors.general}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              type="email"
              label={t('common.email')}
              placeholder={t('auth.login.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              icon={<EmailIcon className="w-5 h-5" />}
            />

            <Input
              type="password"
              label={t('common.password')}
              placeholder={t('auth.login.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              icon={<LockIcon className="w-5 h-5" />}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-secondary">{t('auth.login.rememberMe')}</span>
              </label>
              <a href="#" className="text-sm text-primary hover:underline">
                {t('auth.login.forgotPassword')}
              </a>
            </div>

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              {t('auth.login.submit')}
            </Button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-text-secondary">
            {t('auth.login.noAccount')}{' '}
            <Link href={`/${locale}/register`} className="text-primary font-medium hover:underline">
              {t('auth.login.signUp')}
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary via-primary-dark to-secondary relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 pattern-dots opacity-20" />
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-white">
          <div className="w-24 h-24 rounded-2xl bg-white/10 flex items-center justify-center mb-8">
            <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-3xl">د</span>
            </div>
          </div>
          
          <h2 className="text-3xl font-heading font-bold text-center mb-4">
            {t('common.tagline')}
          </h2>
          
          <p className="text-center text-white/80 max-w-md">
            {t('landing.hero.subtitle').split('.')[0]}.
          </p>

          {/* Features List */}
          <div className="mt-12 space-y-4">
            {[
              t('landing.features.buildings.title'),
              t('landing.features.residents.title'),
              t('landing.features.finances.title'),
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <CheckIcon className="w-4 h-4" />
                </div>
                <span className="text-white/90">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  )
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}
