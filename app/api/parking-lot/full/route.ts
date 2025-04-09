import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';

export async function GET() {
    try {
        console.log('[API] GET /api/parking-lot/full - Starting request processing');

        // Get user session to retrieve parking lot information
        const session = await getServerSession(authOptions);
        console.log('[API] Session retrieved:', session ? 'Success' : 'Failed');

        if (!session || !session.user) {
            console.log('[API] Unauthorized access attempt - No valid session');
            return NextResponse.json(
                { error: "Unauthorized access" },
                { status: 401 }
            );
        }

        // Get parkingLotId from user session
        const parkingLotId = session.user.parkingLot?.parkingLotId;
        const username = session.user.email;

        console.log(`[API] GET /api/parking-lot/full - Request received for user: ${username}, parkingLotId: ${parkingLotId}`);

        if (!parkingLotId) {
            console.log('[API] Error: No parking lot ID associated with user');
            return NextResponse.json(
                { error: "No parking lot associated with user and none provided in request" },
                { status: 400 }
            );
        }

        // Make request to the external API
        const apiUrl = `${process.env.API_URL}/api/parkinglot/${parkingLotId}/full`;
        console.log(`[API] Calling external API: ${apiUrl}`);
        const startTime = Date.now();

        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const requestDuration = Date.now() - startTime;
        console.log(`[API] External API response received in ${requestDuration}ms with status: ${response.status}`);

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`[API] External API returned error: ${response.status}`, errorData);
            return NextResponse.json(
                { error: errorData.message || "Failed to fetch full parking lot details" },
                { status: response.status }
            );
        }

        const data = await response.json();

        console.log(`[API] Successfully retrieved full parking lot details for ID: ${parkingLotId}`);
        console.log(`[API] Data summary: ${data.parkingLot ? 'ParkingLot found' : 'No ParkingLot'}, Areas: ${data.areas?.length || 0}, Floors: ${data.floors?.length || 0}, Spaces: ${data.parkingSpaces?.length || 0}`);

        return NextResponse.json({
            success: true,
            data: data
        });

    } catch (error) {
        console.error("[API] Error fetching full parking lot details:", error);
        console.error("[API] Error stack:", error instanceof Error ? error.stack : 'No stack trace available');

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
