import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const inviteSchema = z.object({
  code: z.string().min(1, 'House code is required'),
})

const addFlatmateSchema = z.object({
  houseId: z.string(),
  userId: z.string(),
})

// POST join a house using invite code
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

    // If code is provided, join by code
    if (body.code) {
      const validatedData = inviteSchema.parse(body)

      const house = await prisma.flatmateHouse.findUnique({
        where: { code: validatedData.code },
        include: {
          flatmates: true
        }
      })

      if (!house) {
        return NextResponse.json(
          { error: 'Invalid house code' },
          { status: 404 }
        )
      }

      // Check if user is already a member
      const isMember = house.flatmates.some(
        flatmate => flatmate.userId === session.user.id
      )

      if (isMember) {
        return NextResponse.json(
          { error: 'You are already a member of this house' },
          { status: 400 }
        )
      }

      // Add user to house
      const flatmate = await prisma.flatmate.create({
        data: {
          userId: session.user.id,
          houseId: house.id,
          role: 'member'
        },
        include: {
          house: {
            include: {
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
          }
        }
      })

      return NextResponse.json(
        { 
          message: 'Joined house successfully',
          house: flatmate.house
        },
        { status: 201 }
      )
    } 
    
    // Otherwise, add flatmate by user ID (for admin actions)
    if (body.houseId && body.userId) {
      const validatedData = addFlatmateSchema.parse(body)

      // Verify the requester is a member
      const requesterFlatmate = await prisma.flatmate.findUnique({
        where: {
          userId_houseId: {
            userId: session.user.id,
            houseId: validatedData.houseId
          }
        }
      })

      if (!requesterFlatmate) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        )
      }

      const flatmate = await prisma.flatmate.create({
        data: {
          userId: validatedData.userId,
          houseId: validatedData.houseId,
          role: 'member'
        },
        include: {
          user: {
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
          message: 'Flatmate added successfully',
          flatmate 
        },
        { status: 201 }
      )
    }

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error adding flatmate:', error)
    return NextResponse.json(
      { error: 'An error occurred while adding flatmate' },
      { status: 500 }
    )
  }
}

