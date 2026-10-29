import { NextRequest, NextResponse } from 'next/server'
import { notifyNearbyUsers } from '@/lib/notifications'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const {
            petId,
            petName,
            petType,
            petBreed,
            petDescription,
            lastSeenAddress,
            lastSeenDistrict,
            lastSeenLat,
            lastSeenLng,
            petImageUrl
        } = body

        // Validate required fields
        if (!petId || !petName || !petType || !lastSeenDistrict || !lastSeenLat || !lastSeenLng) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Send notifications
        const result = await notifyNearbyUsers({
            petId,
            petName,
            petType,
            petBreed,
            petDescription,
            lastSeenAddress,
            lastSeenDistrict,
            lastSeenLat,
            lastSeenLng,
            petImageUrl
        })

        if (result.error) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            notified: result.notified
        })

    } catch (error: any) {
        console.error('Error in notify-nearby-users API:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
