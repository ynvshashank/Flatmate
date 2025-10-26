'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Home, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match')
      return
    }
    // TODO: Implement registration
    console.log('Registration attempt:', formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-2">
              <Home className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">Flatmate</h1>
            </Link>
            <Link href="/" className="flex items-center text-gray-600 hover:text-primary-600 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Registration Form */}
      <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              Join Flatmate and start organizing your shared space
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full">
                Create Account
              </Button>
              
              <div className="text-center">
                <Link href="/" className="text-sm text-primary-600 hover:underline">
                  Already have an account? Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="mt-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            What you'll get:
          </h3>
          <div className="space-y-2 text-gray-600">
            <p>✓ Create shared todo lists with your flatmates</p>
            <p>✓ Assign tasks and set deadlines</p>
            <p>✓ Get smart notifications and reminders</p>
            <p>✓ Schedule recurring tasks</p>
          </div>
        </div>
      </main>
    </div>
  )
}


