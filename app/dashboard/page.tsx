'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { 
  Home,
  Plus,
  Search,
  RefreshCw,
  Users,
  MoreVertical,
  LogOut,
  UserPlus,
  Trash2,
  DoorOpen
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getAuthToken, removeAuthToken, housesApi } from '@/lib/api'
import { toast } from 'react-hot-toast'

interface House {
  id: string
  name: string
  description?: string
  members_count: number
  created_at: string
  is_creator: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  const [houses, setHouses] = useState<House[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateHouse, setShowCreateHouse] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [selectedHouseForInvite, setSelectedHouseForInvite] = useState<string | null>(null)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  
  const [newHouse, setNewHouse] = useState({
    name: '',
    description: ''
  })
  
  const [inviteEmail, setInviteEmail] = useState('')

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      router.push('/')
      return
    }
    fetchHouses()
  }, [router])

  const fetchHouses = async () => {
    setLoading(true)
    try {
      const result = await housesApi.getUserHouses()
      if (result.error) {
        toast.error(result.error)
      } else if (result.data) {
        setHouses(result.data)
      }
    } catch (error) {
      toast.error('Failed to fetch houses')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateHouse = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newHouse.name.trim()) {
      toast.error('Please enter a house name')
      return
    }

    try {
      const result = await housesApi.createHouse(newHouse.name, newHouse.description)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('House created successfully!')
        setShowCreateHouse(false)
        setNewHouse({ name: '', description: '' })
        fetchHouses()
      }
    } catch (error) {
      toast.error('Failed to create house')
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedHouseForInvite || !inviteEmail.trim()) {
      toast.error('Please enter an email')
      return
    }

    try {
      const result = await housesApi.inviteToHouse(selectedHouseForInvite, inviteEmail)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Invitation sent successfully!')
        setShowInviteModal(false)
        setInviteEmail('')
        setSelectedHouseForInvite(null)
      }
    } catch (error) {
      toast.error('Failed to send invitation')
    }
  }

  const handleExitHouse = async (houseId: string) => {
    if (!confirm('Are you sure you want to exit this house?')) return

    try {
      const result = await housesApi.exitHouse(houseId)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Exited house successfully')
        fetchHouses()
      }
    } catch (error) {
      toast.error('Failed to exit house')
    }
  }

  const handleDeleteHouse = async (houseId: string) => {
    if (!confirm('Are you sure you want to delete this house? This action cannot be undone.')) return

    try {
      const result = await housesApi.deleteHouse(houseId)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('House deleted successfully')
        fetchHouses()
      }
    } catch (error) {
      toast.error('Failed to delete house')
    }
  }

  const handleLogout = () => {
    removeAuthToken()
    toast.success('Logged out successfully')
    router.push('/')
  }

  const filteredHouses = houses.filter(house =>
    house.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Home className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">Flatmate</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                <Search className="h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search houses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm w-48"
                />
              </div>

              {/* Sync */}
              <Button
                variant="ghost"
                size="icon"
                onClick={fetchHouses}
                title="Refresh"
              >
                <RefreshCw className="h-5 w-5" />
              </Button>

              {/* Navigation Links */}
              <Link href="/connections">
                <Button variant="ghost">
                  Connections
                </Button>
              </Link>

              <Link href="/settings">
                <Button variant="ghost">
                  Settings
                </Button>
              </Link>

              {/* Create House */}
              <Button onClick={() => setShowCreateHouse(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create House
              </Button>

              {/* Logout */}
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">My Houses</h2>
          <p className="text-gray-600">Manage your shared living spaces</p>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mb-6">
          <div className="flex items-center space-x-2 bg-white rounded-lg px-3 py-2 border">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search houses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-none outline-none text-sm"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your houses...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && houses.length === 0 && (
          <div className="text-center py-12">
            <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No houses yet</h3>
            <p className="text-gray-600 mb-6">Create your first house to get started</p>
            <Button onClick={() => setShowCreateHouse(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First House
            </Button>
          </div>
        )}

        {/* Houses Grid */}
        {!loading && filteredHouses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHouses.map((house) => (
              <Card key={house.id} className="hover:shadow-lg transition-shadow relative">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1">{house.name}</CardTitle>
                      {house.description && (
                        <CardDescription>{house.description}</CardDescription>
                      )}
                    </div>
                    
                    {/* Menu */}
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setActiveMenu(activeMenu === house.id ? null : house.id)}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                      
                      {activeMenu === house.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                          <button
                            onClick={() => {
                              setSelectedHouseForInvite(house.id)
                              setShowInviteModal(true)
                              setActiveMenu(null)
                            }}
                            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Invite Member
                          </button>
                          
                          {!house.is_creator && (
                            <button
                              onClick={() => {
                                handleExitHouse(house.id)
                                setActiveMenu(null)
                              }}
                              className="w-full flex items-center px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50"
                            >
                              <DoorOpen className="h-4 w-4 mr-2" />
                              Exit House
                            </button>
                          )}
                          
                          {house.is_creator && (
                            <button
                              onClick={() => {
                                handleDeleteHouse(house.id)
                                setActiveMenu(null)
                              }}
                              className="w-full flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 rounded-b-lg"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete House
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center text-gray-600 mb-4">
                    <Users className="h-4 w-4 mr-2" />
                    <span className="text-sm">{house.members_count} member{house.members_count !== 1 ? 's' : ''}</span>
                  </div>
                  
                  <Link href={`/house/${house.id}`}>
                    <Button className="w-full">
                      View Tasks
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Search Results */}
        {!loading && houses.length > 0 && filteredHouses.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No houses found</h3>
            <p className="text-gray-600">Try a different search term</p>
          </div>
        )}
      </main>

      {/* Create House Modal */}
      {showCreateHouse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New House</CardTitle>
              <CardDescription>Set up a new shared living space</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateHouse} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="houseName">House Name</Label>
                  <Input
                    id="houseName"
                    value={newHouse.name}
                    onChange={(e) => setNewHouse(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., My Apartment"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="houseDescription">Description (Optional)</Label>
                  <Input
                    id="houseDescription"
                    value={newHouse.description}
                    onChange={(e) => setNewHouse(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Add a description"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1">
                    Create House
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowCreateHouse(false)
                      setNewHouse({ name: '', description: '' })
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Invite Member</CardTitle>
              <CardDescription>Send an invitation to join this house</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="inviteEmail">Email Address</Label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="flatmate@email.com"
                    required
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1">
                    Send Invitation
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowInviteModal(false)
                      setInviteEmail('')
                      setSelectedHouseForInvite(null)
                    }}
                    className="flex-1"
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
