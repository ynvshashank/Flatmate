import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET single house
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

    const house = await prisma.flatmateHouse.findUnique({
      where: { id: params.id },
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
            tasks: true,
            flatmates: true
          }
        }
      }
    })

    if (!house) {
      return NextResponse.json(
        { error: 'House not found' },
        { status: 404 }
      )
    }

    // Verify user is a member
    const isMember = house.flatmates.some(
      flatmate => flatmate.userId === session.user.id
    )

    if (!isMember) {
      return NextResponse.json(
        { error: 'Unauthorized to view this house' },
        { status: 403 }
      )
    }

    return NextResponse.json({ house })
  } catch (error) {
    console.error('Error fetching house:', error)
    return NextResponse.json(
      { error: 'An error occurred while fetching house' },
      { status: 500 }
    )
  }
}

// DELETE house
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

    const house = await prisma.flatmateHouse.findUnique({
      where: { id: params.id }
    })

    if (!house) {
      return NextResponse.json(
        { error: 'House not found' },
        { status: 404 }
      )
    }

    // Only the creator can delete the house
    if (house.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the house creator can delete this house' },
        { status: 403 }
      )
    }

    await prisma.flatmateHouse.delete({
      where: { id: params.id }
    })

    return NextResponse.json(
      { message: 'House deleted successfully' }
    )
  } catch (error) {
    console.error('Error deleting house:', error)
    return NextResponse.json(
      { error: 'An error occurred while deleting house' },
      { status: 500 }
    )
  }
}

