import { Resend } from 'resend'
import { createClient } from '@/utils/supabase/server'
import { render } from '@react-email/render'
import { PetAlertEmail } from '@/emails/pet-alert-template'
import { assertServerEnv } from '@/lib/env'

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371 // Earth's radius in km
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

function toRad(degrees: number): number {
    return degrees * (Math.PI / 180)
}

interface PetReportData {
    petId: string
    petName: string
    petType: string
    petBreed?: string
    petDescription?: string
    lastSeenAddress: string
    lastSeenDistrict: string
    lastSeenLat: number
    lastSeenLng: number
    petImageUrl?: string
}

/**
 * Send notification emails to users within radius of lost pet location
 */
export async function notifyNearbyUsers(reportData: PetReportData) {
    const supabase = await createClient()
    const { resendApiKey, appUrl } = assertServerEnv()

    if (!resendApiKey) {
        throw new Error('Email service not configured')
    }

    const resend = new Resend(resendApiKey)

    try {
        // Get all users with notification preferences and coordinates
        const { data: users, error: usersError } = await supabase
            .from('profiles')
            .select('id, full_name, email, notification_lat, notification_lng, notification_radius_km, notifications_enabled')
            .eq('notifications_enabled', true)
            .not('notification_lat', 'is', null)
            .not('notification_lng', 'is', null)

        if (usersError) {
            console.error('Error fetching users for notifications:', usersError)
            return { error: usersError.message }
        }

        if (!users || users.length === 0) {
            console.log('No users with notification preferences found')
            return { success: true, notified: 0 }
        }

        // Filter users within radius and send emails
        let notifiedCount = 0
        const reportUrl = `${appUrl || 'http://localhost:3000'}/pets/${reportData.petId}`

        for (const user of users) {
            const distance = calculateDistance(
                reportData.lastSeenLat,
                reportData.lastSeenLng,
                user.notification_lat!,
                user.notification_lng!
            )

            const userRadius = user.notification_radius_km || 5

            // If user is within their notification radius
            if (distance <= userRadius) {
                try {
                    // Get user's email from auth
                    const { data: authUser } = await supabase.auth.admin.getUserById(user.id)

                    if (!authUser?.user?.email) {
                        console.log(`No email found for user ${user.id}`)
                        continue
                    }

                    const emailHtml = await render(
                        PetAlertEmail({
                            reporterName: user.full_name || 'Usuario',
                            name: reportData.petName,
                            type: reportData.petType,
                            breed: reportData.petBreed || "",


                            lastSeenDistrict: reportData.lastSeenDistrict,


                            imageUrl: reportData.petImageUrl,
                            reportUrl,

                        })
                    )

                    await resend.emails.send({
                        from: 'BuscoMiMascotaPerdida <notificaciones@buscomimascotaperdida.com>',
                        to: authUser.user.email,
                        subject: `🚨 Mascota perdida cerca de ti: ${reportData.petName} en ${reportData.lastSeenDistrict}`,
                        html: emailHtml,
                    })

                    notifiedCount++
                    console.log(`Notification sent to ${authUser.user.email} (${distance.toFixed(1)}km away)`)
                } catch (emailError: any) {
                    console.error(`Failed to send email to user ${user.id}:`, emailError)
                    // Continue with other users even if one fails
                }
            }
        }

        console.log(`Successfully notified ${notifiedCount} users`)
        return { success: true, notified: notifiedCount }

    } catch (error: any) {
        console.error('Error in notifyNearbyUsers:', error)
        return { error: error.message }
    }
}
