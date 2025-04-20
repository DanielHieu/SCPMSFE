import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { apiFetch } from '@/lib/utils/api';

export async function GET(request: NextRequest) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    try {
        console.log('[API] GET /api/parking-lot/stats - Request received');

        // Get user session
        const session = await getServerSession(authOptions);
        console.log('[API] Session data:', JSON.stringify(session, null, 2));

        if (!session || !session.user) {
            console.log('[API] Authentication failed - User not authenticated');
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get parking lot ID from session
        const parkingLotId = session.user.parkingLot?.parkingLotId;
        console.log(`[API] Parking lot ID from session: ${parkingLotId}`);

        if (!parkingLotId) {
            console.log('[API] Missing parking lot ID');
            return NextResponse.json(
                { error: "Missing parking lot ID" },
                { status: 400 }
            );
        }

        // Call external API to get stats
        const apiUrl = `/api/parkingLot/${parkingLotId}/stats`;
        console.log(`[API] Calling external API: ${apiUrl}`);

        const response = await apiFetch(apiUrl);

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`[API] External API returned error: ${response.status}`, errorData);
            return NextResponse.json(
                { error: errorData.message || "Failed to fetch parking lot statistics" },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log('[API] Successfully fetched parking lot stats:', JSON.stringify(data, null, 2));

        return NextResponse.json(data);

    } catch (error) {
        console.error("[API] Error fetching parking lot stats:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
