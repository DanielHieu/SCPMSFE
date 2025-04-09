import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        // Get parkingLotId from query string
        const { searchParams } = new URL(request.url);
        const parkingLotId = searchParams.get('parkingLotId');

        console.log(`[API] GET /api/auth/areas - Request received with parkingLotId: ${parkingLotId}`);

        if (!parkingLotId) {
            return NextResponse.json(
                { error: "parkingLotId is required" },
                { status: 400 }
            );
        }

        // Make request to the external API
        const apiUrl = `${process.env.API_URL}/api/area/getareasbyparkinglot?parkingLotId=${parkingLotId}`;
        console.log(`[API] Calling external API: ${apiUrl}`);

        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`[API] External API returned error: ${response.status}`, errorData);
            return NextResponse.json(
                { error: errorData.message || "Failed to fetch areas" },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log('[API] Successfully retrieved areas:', JSON.stringify(data, null, 2));

        return NextResponse.json({
            success: true,
            data: data
        });

    } catch (error) {
        console.error("[API] Error fetching areas:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
