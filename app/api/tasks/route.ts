import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
  houseId: z.string(),
  reminderEnabled: z.boolean().default(false),
  reminderInterval: z.number().optional(),
  isRecurring: z.boolean().default(false),
  recurrencePattern: z.string().optional(),
  recurrenceEndDate: z.string().optional(),
})

// GET all tasks for a house
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const houseId = searchParams.get('houseId')

    if (!houseId) {
      return NextResponse.json(
        { error: 'House ID is required' },
        { status: 400 }
      )
    }

    // Verify user is a member of this house
    const flatmate = await prisma.flatmate.findUnique({
      where: {
        userId_houseId: {
          userId: session.user.id,
          houseId: houseId
        }
      }
    })

    if (!flatmate) {
      return NextResponse.json(
        { error: 'You are not a member of this house' },
        { status: 403 }
      )
    }

    const tasks = await prisma.task.findMany({
      where: {
        houseId: houseId
      },
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'An error occurred while fetching tasks' },
      { status: 500 }
    )
  }
}

// POST create a new task
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = taskSchema.parse(body)

    // Verify user is a member of this house
    const flatmate = await prisma.flatmate.findUnique({
      where: {
        userId_houseId: {
          userId: session.user.id,
          houseId: validatedData.houseId
        }
      }
    })

    if (!flatmate) {
      return NextResponse.json(
        { error: 'You are not a member of this house' },
        { status: 403 }
      )
    }

    const task = await prisma.task.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        priority: validatedData.priority,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        creatorId: session.user.id,
        assigneeId: validatedData.assigneeId,
        houseId: validatedData.houseId,
        reminderEnabled: validatedData.reminderEnabled,
        reminderInterval: validatedData.reminderInterval,
        isRecurring: validatedData.isRecurring,
        recurrencePattern: validatedData.recurrencePattern,
        recurrenceEndDate: validatedData.recurrenceEndDate ? new Date(validatedData.recurrenceEndDate) : null,
      },
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
        message: 'Task created successfully',
        task 
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'An error occurred while creating task' },
      { status: 500 }
    )
  }
}

