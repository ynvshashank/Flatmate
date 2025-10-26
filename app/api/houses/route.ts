import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { customAlphabet } from 'nanoid'

const houseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
})

// GET all houses for the current user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const houses = await prisma.flatmate.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        house: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            },
            flatmates: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  }
                }
              }
            },
            _count: {
              select: {
                tasks: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ houses })
  } catch (error) {
    console.error('Error fetching houses:', error)
    return NextResponse.json(
      { error: 'An error occurred while fetching houses' },
      { status: 500 }
    )
  }
}

// POST create a new house
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
    const validatedData = houseSchema.parse(body)

    // Generate a unique invite code
    const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8)
    const code = nanoid()

    const house = await prisma.flatmateHouse.create({
      data: {
        name: validatedData.name,
        code: code,
        creatorId: session.user.id,
        flatmates: {
          create: {
            userId: session.user.id,
            role: 'admin'
          }
        }
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        flatmates: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        }
      }
    })

    return NextResponse.json(
      { 
        message: 'House created successfully',
        house 
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

    console.error('Error creating house:', error)
    return NextResponse.json(
      { error: 'An error occurred while creating house' },
      { status: 500 }
    )
  }
}

