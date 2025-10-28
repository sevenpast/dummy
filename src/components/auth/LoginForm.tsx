'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showResendConfirmation, setShowResendConfirmation] = useState(false)
  const [showResetOption, setShowResetOption] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const supabase = createClient()
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError(null)
    setSuccess(null)
    setShowResendConfirmation(false)
    setShowResetOption(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // In development, bypass email confirmation
      if (process.env.NODE_ENV === 'development') {
        // Try normal login first
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        })

        if (!signInError && signInData.user) {
          setSuccess('Login successful!')
          router.push('/dashboard')
        } else if (signInError?.message?.includes('Email not confirmed')) {
          // If email not confirmed, try to create the user and sign in
          try {
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email: formData.email,
              password: formData.password,
              options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
                data: {
                  skip_email_confirmation: true
                }
              }
            })

            if (signUpError) {
              throw new Error('User creation failed: ' + signUpError.message)
            }

            // Wait a moment and try to sign in
            setTimeout(async () => {
              const { data: retrySignIn, error: retryError } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password
              })

              if (!retryError && retrySignIn.user) {
                setSuccess('Account created and signed in successfully!')
                router.push('/dashboard')
              } else {
                setError('Account created but login failed. Please try again.')
              }
            }, 2000)
          } catch (createErr) {
            throw new Error('Failed to create user: ' + (createErr instanceof Error ? createErr.message : 'Unknown error'))
          }
        } else {
          throw signInError
        }
      } else {
        // Production flow
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        })

        if (error) {
          throw error
        }

        // Redirect to dashboard on success
        router.push('/dashboard')
      }
    } catch (err) {
      console.error('Login error:', err)
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during login'
      
      if (errorMessage.includes('Email not confirmed')) {
        if (process.env.NODE_ENV === 'development') {
          setError('Email not confirmed. In development, you can reset your account and sign up again.')
          setShowResetOption(true)
        } else {
          setError('Please check your email and click the confirmation link before logging in.')
          setShowResendConfirmation(true)
        }
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    if (!formData.email) {
      setError('Please enter your email address first')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        throw error
      }

      setSuccess('Confirmation email sent! Please check your inbox.')
      setShowResendConfirmation(false)
    } catch (err) {
      console.error('Resend confirmation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to resend confirmation email')
    } finally {
      setLoading(false)
    }
  }

  const handleResetAccount = async () => {
    if (!formData.email) {
      setError('Please enter your email address first')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/auth/dev-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Reset failed')
      }

      setSuccess(result.message)
      setShowResetOption(false)
    } catch (err) {
      console.error('Reset account error:', err)
      setError(err instanceof Error ? err.message : 'Failed to reset account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-amber-900 mb-8">
              Welcome to Village
            </h1>
          </div>
        
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Pre-filled"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Value"
                />
              </div>
            </div>
            
            <div className="text-left">
              <a href="#" className="text-sm text-gray-600 hover:text-gray-800 underline">
                Forgot your password?
              </a>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                      {showResendConfirmation && (
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={handleResendConfirmation}
                            disabled={loading}
                            className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                          >
                            {loading ? 'Sending...' : 'Resend Confirmation Email'}
                          </button>
                        </div>
                      )}
                      {showResetOption && (
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={handleResetAccount}
                            disabled={loading}
                            className="text-sm bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700 disabled:opacity-50"
                          >
                            {loading ? 'Resetting...' : 'Reset Account (Dev Only)'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Success</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>{success}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                Login
              </button>
            </div>

            <div className="text-center">
              <a
                href="/auth/signup"
                className="text-sm text-orange-600 hover:text-orange-500 font-medium"
              >
                New here? Sign up!
              </a>
            </div>
          </form>
        </div>
      </div>
      
      {/* Footer - Fixed at bottom */}
      <div className="bg-orange-200 h-8 flex items-center justify-between px-4">
        <span className="text-sm text-gray-700 font-medium">Village</span>
        <div className="flex space-x-4 text-sm text-gray-700">
          <a href="#" className="hover:text-gray-900">About</a>
          <span>|</span>
          <a href="#" className="hover:text-gray-900">Privacy</a>
          <span>|</span>
          <a href="#" className="hover:text-gray-900">Terms</a>
        </div>
      </div>
    </div>
  )
}
