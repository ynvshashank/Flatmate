'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Home,
  ArrowLeft,
  UserPlus,
  Users,
  Mail,
  Search,
  UserCheck,
  UserX
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getAuthToken } from '@/lib/api'
import { toast } from 'react-hot-toast'

interface Connection {
  id: string
  name: string
  email: string
  status: 'pending' | 'accepted' | 'blocked'
  created_at: string
}

export default function ConnectionsPage() {
  const router = useRouter()
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      router.push('/')
      return
    }
    fetchConnections()
  }, [router])

  const fetchConnections = async () => {
    setLoading(true)
    try {
      // Mock data for now - replace with actual API call
      const mockConnections: Connection[] = [
        {
          id: '1',
          name: 'Alice Johnson',
          email: 'alice@example.com',
          status: 'accepted',
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          name: 'Bob Smith',
          email: 'bob@example.com',
          status: 'pending',
          created_at: '2024-01-20T14:30:00Z'
        },
        {
          id: '3',
          name: 'Carol Davis',
          email: 'carol@example.com',
          status: 'accepted',
          created_at: '2024-01-10T09:15:00Z'
        }
      ]
      setConnections(mockConnections)
    } catch (error) {
      toast.error('Failed to fetch connections')
    } finally {
      setLoading(false)
    }
  }

  const handleInviteConnection = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address')
      return
    }

    setInviting(true)
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay

      toast.success('Invitation sent successfully!')
      setShowInviteModal(false)
      setInviteEmail('')
      fetchConnections()
    } catch (error) {
      toast.error('Failed to send invitation')
    } finally {
      setInviting(false)
    }
  }

  const handleAcceptConnection = async (connectionId: string) => {
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 500))

      setConnections(connections.map(conn =>
        conn.id === connectionId ? { ...conn, status: 'accepted' as const } : conn
      ))
      toast.success('Connection accepted!')
    } catch (error) {
      toast.error('Failed to accept connection')
    }
  }

  const handleBlockConnection = async (connectionId: string) => {
    if (!confirm('Are you sure you want to block this connection?')) return

    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 500))

      setConnections(connections.filter(conn => conn.id !== connectionId))
      toast.success('Connection blocked')
    } catch (error) {
      toast.error('Failed to block connection')
    }
  }

  const filteredConnections = connections.filter(connection =>
    connection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    connection.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const acceptedConnections = filteredConnections.filter(conn => conn.status === 'accepted')
  const pendingConnections = filteredConnections.filter(conn => conn.status === 'pending')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'blocked': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Home className="h-8 w-8 text-primary-600" />
                <h1 className="text-2xl font-bold text-gray-900">Connections</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button onClick={() => setShowInviteModal(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Connection
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Connections</h2>
          <p className="text-gray-600">Manage your global connections across all houses</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 bg-white rounded-lg px-3 py-2 border max-w-md">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search connections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-none outline-none text-sm"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Connections</p>
                  <p className="text-2xl font-bold text-gray-900">{connections.length}</p>
                </div>
                <Users className="h-8 w-8 text-primary-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Accepted</p>
                  <p className="text-2xl font-bold text-green-600">{acceptedConnections.length}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingConnections.length}</p>
                </div>
                <Mail className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Users className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading connections...</p>
          </div>
        )}

        {/* Connections */}
        {!loading && (
          <div className="space-y-8">
            {/* Pending Connections */}
            {pendingConnections.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Pending Invitations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingConnections.map((connection) => (
                    <Card key={connection.id} className="border-yellow-200 bg-yellow-50">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-yellow-600">
                                {connection.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <CardTitle className="text-lg">{connection.name}</CardTitle>
                              <CardDescription>{connection.email}</CardDescription>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(connection.status)}`}>
                            {connection.status}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleAcceptConnection(connection.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleBlockConnection(connection.id)}
                            className="flex-1 text-red-600 hover:text-red-700"
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Block
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Accepted Connections */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Connections</h3>
              {acceptedConnections.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No accepted connections yet</p>
                    <Button onClick={() => setShowInviteModal(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Your First Connection
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {acceptedConnections.map((connection) => (
                    <Card key={connection.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-primary-600">
                                {connection.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <CardTitle className="text-lg">{connection.name}</CardTitle>
                              <CardDescription>{connection.email}</CardDescription>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(connection.status)}`}>
                            {connection.status}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600">
                          Connected since {new Date(connection.created_at).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Invite Connection</CardTitle>
              <CardDescription>Send an invitation to connect with someone</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInviteConnection} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="inviteEmail">Email Address</Label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="friend@example.com"
                    required
                    disabled={inviting}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1" disabled={inviting}>
                    {inviting ? 'Sending...' : 'Send Invitation'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowInviteModal(false)
                      setInviteEmail('')
                    }}
                    className="flex-1"
                    disabled={inviting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
