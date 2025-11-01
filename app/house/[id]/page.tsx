'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { 
  Home,
  Plus,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Edit,
  Trash2,
  Calendar,
  User,
  Clock,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { getAuthToken, tasksApi } from '@/lib/api'
import { toast } from 'react-hot-toast'

interface Task {
  id: string
  title: string
  description?: string
  assigned_to?: string
  deadline?: string
  priority?: string
  completed: boolean
  completed_at?: string
  created_at: string
}

export default function HousePage() {
  const router = useRouter()
  const params = useParams()
  const houseId = params.id as string

  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddTask, setShowAddTask] = useState(false)
  const [showEditTask, setShowEditTask] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigned_to: '',
    deadline: '',
    priority: 'medium'
  })

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      router.push('/')
      return
    }
    fetchTasks()
  }, [router, houseId])

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const result = await tasksApi.getTodayTasks(houseId)
      if (result.error) {
        toast.error(result.error)
      } else if (result.data) {
        setTasks(result.data)
      }
    } catch (error) {
      toast.error('Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newTask.title.trim()) {
      toast.error('Please enter a task title')
      return
    }

    try {
      const result = await tasksApi.createTask({
        title: newTask.title,
        description: newTask.description || undefined,
        house_id: houseId,
        assigned_to: newTask.assigned_to || undefined,
        deadline: newTask.deadline || undefined,
        priority: newTask.priority
      })
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Task created successfully!')
        setShowAddTask(false)
        setNewTask({ title: '', description: '', assigned_to: '', deadline: '', priority: 'medium' })
        fetchTasks()
      }
    } catch (error) {
      toast.error('Failed to create task')
    }
  }

  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingTask) return

    try {
      const result = await tasksApi.updateTask(editingTask.id, {
        title: editingTask.title,
        description: editingTask.description,
        assigned_to: editingTask.assigned_to,
        deadline: editingTask.deadline,
        priority: editingTask.priority
      })
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Task updated successfully!')
        setShowEditTask(false)
        setEditingTask(null)
        fetchTasks()
      }
    } catch (error) {
      toast.error('Failed to update task')
    }
  }

  const handleToggleComplete = async (taskId: string, currentStatus: boolean) => {
    try {
      if (!currentStatus) {
        const result = await tasksApi.completeTask(taskId)
        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success('Task marked as complete!')
          fetchTasks()
        }
      } else {
        // Reopen task by updating completed status
        const result = await tasksApi.updateTask(taskId, { completed: false })
        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success('Task reopened!')
          fetchTasks()
        }
      }
    } catch (error) {
      toast.error('Failed to update task')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const result = await tasksApi.deleteTask(taskId)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Task deleted successfully')
        fetchTasks()
      }
    } catch (error) {
      toast.error('Failed to delete task')
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const pendingTasks = tasks.filter(task => !task.completed)
  const completedTasks = tasks.filter(task => task.completed)

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
                <h1 className="text-2xl font-bold text-gray-900">House Tasks</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button onClick={() => setShowAddTask(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-primary-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingTasks.length}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{completedTasks.length}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Clock className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading tasks...</p>
          </div>
        )}

        {/* Pending Tasks */}
        {!loading && (
          <div className="space-y-8">
            {/* Today's Tasks */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Today's Tasks</h2>
              {pendingTasks.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No pending tasks. Great job!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingTasks.map((task) => (
                    <Card key={task.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <button
                              onClick={() => handleToggleComplete(task.id, task.completed)}
                              className="mt-1"
                            >
                              <Circle className="h-5 w-5 text-gray-400 hover:text-primary-600 transition-colors" />
                            </button>
                            <div className="flex-1">
                              <CardTitle className="text-lg">{task.title}</CardTitle>
                              {task.description && (
                                <CardDescription className="mt-1">{task.description}</CardDescription>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-2">
                          {task.assigned_to && (
                            <div className="flex items-center text-sm text-gray-600">
                              <User className="h-4 w-4 mr-2" />
                              <span>{task.assigned_to}</span>
                            </div>
                          )}
                          
                          {task.deadline && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>{new Date(task.deadline).toLocaleDateString()}</span>
                            </div>
                          )}
                          
                          {task.priority && (
                            <div className="flex items-center">
                              <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
                                {task.priority.toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingTask(task)
                              setShowEditTask(true)
                            }}
                            className="flex-1"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTask(task.id)}
                            className="flex-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* House History */}
            {completedTasks.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">House History</h2>
                <div className="space-y-3">
                  {completedTasks.map((task) => (
                    <Card key={task.id} className="bg-green-50 border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <button
                              onClick={() => handleToggleComplete(task.id, task.completed)}
                            >
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            </button>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 line-through">{task.title}</h3>
                              {task.description && (
                                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                              )}
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                {task.assigned_to && (
                                  <span className="flex items-center">
                                    <User className="h-3 w-3 mr-1" />
                                    {task.assigned_to}
                                  </span>
                                )}
                                {task.completed_at && (
                                  <span className="flex items-center">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Completed {new Date(task.completed_at).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Add New Task</CardTitle>
              <CardDescription>Create a new task for this house</CardDescription>
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
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter task description"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="assigned_to">Assign To (Optional)</Label>
                  <Input
                    id="assigned_to"
                    value={newTask.assigned_to}
                    onChange={(e) => setNewTask(prev => ({ ...prev, assigned_to: e.target.value }))}
                    placeholder="Enter flatmate name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline (Optional)</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask(prev => ({ ...prev, deadline: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    value={newTask.priority}
                    onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1">
                    Create Task
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowAddTask(false)
                      setNewTask({ title: '', description: '', assigned_to: '', deadline: '', priority: 'medium' })
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

      {/* Edit Task Modal */}
      {showEditTask && editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Edit Task</CardTitle>
              <CardDescription>Update task details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEditTask} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Task Title</Label>
                  <Input
                    id="edit-title"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask(prev => prev ? { ...prev, title: e.target.value } : null)}
                    placeholder="Enter task title"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Input
                    id="edit-description"
                    value={editingTask.description || ''}
                    onChange={(e) => setEditingTask(prev => prev ? { ...prev, description: e.target.value } : null)}
                    placeholder="Enter task description"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-assigned_to">Assign To</Label>
                  <Input
                    id="edit-assigned_to"
                    value={editingTask.assigned_to || ''}
                    onChange={(e) => setEditingTask(prev => prev ? { ...prev, assigned_to: e.target.value } : null)}
                    placeholder="Enter flatmate name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-deadline">Deadline</Label>
                  <Input
                    id="edit-deadline"
                    type="date"
                    value={editingTask.deadline || ''}
                    onChange={(e) => setEditingTask(prev => prev ? { ...prev, deadline: e.target.value } : null)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-priority">Priority</Label>
                  <select
                    id="edit-priority"
                    value={editingTask.priority || 'medium'}
                    onChange={(e) => setEditingTask(prev => prev ? { ...prev, priority: e.target.value } : null)}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1">
                    Update Task
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowEditTask(false)
                      setEditingTask(null)
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
