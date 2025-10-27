import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateTaskSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  completed: z.boolean().optional(),
  dueDate: z.string().nullable().optional(),
  assigneeId: z.string().nullable().optional(),
  reminderEnabled: z.boolean().optional(),
  reminderInterval: z.number().optional(),
})

// GET single task
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        house: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Verify user is a member of the house
    const flatmate = await prisma.flatmate.findUnique({
      where: {
        userId_houseId: {
          userId: session.user.id,
          houseId: task.houseId
        }
      }
    })

    if (!flatmate) {
      return NextResponse.json(
        { error: 'Unauthorized to view this task' },
        { status: 403 }
      )
    }

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json(
      { error: 'An error occurred while fetching task' },
      { status: 500 }
    )
  }
}

// PATCH update task
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateTaskSchema.parse(body)

    // First, get the task to verify user has permission
    const existingTask = await prisma.task.findUnique({
      where: { id: params.id }
    })

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Verify user is a member of the house
    const flatmate = await prisma.flatmate.findUnique({
      where: {
        userId_houseId: {
          userId: session.user.id,
          houseId: existingTask.houseId
        }
      }
    })

    if (!flatmate) {
      return NextResponse.json(
        { error: 'Unauthorized to update this task' },
        { status: 403 }
      )
    }

    // Convert dueDate if provided
    const updateData: any = { ...validatedData }
    if (updateData.dueDate !== undefined) {
      updateData.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : null
    }

    const task = await prisma.task.update({
      where: { id: params.id },
      data: updateData,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    return NextResponse.json(
      { 
        message: 'Task updated successfully',
        task 
      }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: 'An error occurred while updating task' },
      { status: 500 }
    )
  }
}

// DELETE task
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // First, get the task to verify user has permission
    const existingTask = await prisma.task.findUnique({
      where: { id: params.id }
    })

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Only the creator can delete the task
    if (existingTask.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the task creator can delete this task' },
        { status: 403 }
      )
    }

    await prisma.task.delete({
      where: { id: params.id }
    })

    return NextResponse.json(
      { message: 'Task deleted successfully' }
    )
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { error: 'An error occurred while deleting task' },
      { status: 500 }
    )
  }
}


