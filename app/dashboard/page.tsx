'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

import { 
  Plus, 
  Users, 
  CheckSquare, 
  Bell, 
  Calendar, 
  Home,
  UserPlus,
  MoreHorizontal,
  Clock,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

interface Task {
  id: string
  title: string
  description: string
  assignedTo: string
  dueDate: string
  priority: 'low' | 'medium' | 'high'
  completed: boolean
  createdAt: string
}

interface Flatmate {
  id: string
  name: string
  email: string
  avatar?: string
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Take out trash',
      description: 'Empty all bins and take to collection point',
      assignedTo: 'John Doe',
      dueDate: '2024-01-15',
      priority: 'medium',
      completed: false,
      createdAt: '2024-01-10'
    },
    {
      id: '2',
      title: 'Clean kitchen',
      description: 'Wash dishes, clean countertops and stove',
      assignedTo: 'Jane Smith',
      dueDate: '2024-01-12',
      priority: 'high',
      completed: true,
      createdAt: '2024-01-09'
    },
    {
      id: '3',
      title: 'Buy groceries',
      description: 'Weekly shopping for shared items',
      assignedTo: 'Mike Johnson',
      dueDate: '2024-01-14',
      priority: 'low',
      completed: false,
      createdAt: '2024-01-11'
    }
  ])

  const [flatmates, setFlatmates] = useState<Flatmate[]>([
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com' }
  ])

  const [showAddTask, setShowAddTask] = useState(false)
  const [showAddFlatmate, setShowAddFlatmate] = useState(false)
  const [newTask, setNewTask] = useState<{
    title: string
    description: string
    assignedTo: string
    dueDate: string
    priority: 'low' | 'medium' | 'high'
  }>({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    priority: 'medium'
  })

  const [newFlatmate, setNewFlatmate] = useState({
    name: '',
    email: ''
  })

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/tasks?houseId=CURRENT_HOUSE_ID')
        const data = await res.json()
        if (data.tasks) {
          setTasks(data.tasks)
        }
      } catch (error) {
        console.error('Failed to fetch tasks:', error)
      }
    }
    
    if (session) {
      fetchTasks()
    }
  }, [session])

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    const task: Task = {
      id: Date.now().toString(),
      ...newTask,
      completed: false,
      createdAt: new Date().toISOString().split('T')[0]
    }
    setTasks([...tasks, task])
    setNewTask({ title: '', description: '', assignedTo: '', dueDate: '', priority: 'medium' })
    setShowAddTask(false)
  }

  const handleAddFlatmate = (e: React.FormEvent) => {
    e.preventDefault()
    const flatmate: Flatmate = {
      id: Date.now().toString(),
      ...newFlatmate
    }
    setFlatmates([...flatmates, flatmate])
    setNewFlatmate({ name: '', email: '' })
    setShowAddFlatmate(false)
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const pendingTasks = tasks.filter(task => !task.completed)
  const completedTasks = tasks.filter(task => task.completed)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-2">
              <Home className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">Flatmate</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome back!</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckSquare className="h-8 w-8 text-primary-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingTasks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckSquare className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{completedTasks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Flatmates</p>
                  <p className="text-2xl font-bold text-gray-900">{flatmates.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tasks Section */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
              <Button onClick={() => setShowAddTask(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>

            {/* Pending Tasks */}
            <div className="space-y-4 mb-8">
              <h3 className="text-lg font-semibold text-gray-700">Pending Tasks</h3>
              {pendingTasks.map(task => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTaskCompletion(task.id)}
                          className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{task.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-gray-500">Assigned to: {task.assignedTo}</span>
                            <span className="text-sm text-gray-500">Due: {task.dueDate}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">Completed Tasks</h3>
                {completedTasks.map(task => (
                  <Card key={task.id} className="opacity-75 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTaskCompletion(task.id)}
                            className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 line-through">{task.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm text-gray-500">Assigned to: {task.assignedTo}</span>
                              <span className="text-sm text-gray-500">Due: {task.dueDate}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Flatmates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Flatmates</span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowAddFlatmate(true)}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {flatmates.map(flatmate => (
                    <div key={flatmate.id} className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600">
                          {flatmate.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{flatmate.name}</p>
                        <p className="text-xs text-gray-500">{flatmate.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="h-4 w-4 mr-2" />
                  Set Reminder
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Task
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  View Overdue
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add New Task</CardTitle>
              <CardDescription>Create a new task for your flatmates</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddTask} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter task title"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter task description"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assign To</Label>
                  <select
                    id="assignedTo"
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask(prev => ({ ...prev, assignedTo: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select flatmate</option>
                    {flatmates.map(flatmate => (
                      <option key={flatmate.id} value={flatmate.name}>
                        {flatmate.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    value={newTask.priority}
                    onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1">
                    Add Task
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddTask(false)}
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

      {/* Add Flatmate Modal */}
      {showAddFlatmate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add Flatmate</CardTitle>
              <CardDescription>Invite a new flatmate to join your space</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddFlatmate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="flatmateName">Name</Label>
                  <Input
                    id="flatmateName"
                    value={newFlatmate.name}
                    onChange={(e) => setNewFlatmate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter flatmate name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="flatmateEmail">Email</Label>
                  <Input
                    id="flatmateEmail"
                    type="email"
                    value={newFlatmate.email}
                    onChange={(e) => setNewFlatmate(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter flatmate email"
                    required
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1">
                    Add Flatmate
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddFlatmate(false)}
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


