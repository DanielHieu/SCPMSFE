import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { apiFetch } from "@/lib/utils/api";

export async function GET(request: NextRequest) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    try {
        console.log('[API] GET /api/parking-lot/calculate-fee - Request received');

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

        // Get request body
        const licensePlate = request.nextUrl.searchParams.get('licensePlate');
        const parkingLotId = session.user.parkingLot?.parkingLotId;

        console.log(`[API] Request parameters: licensePlate=${licensePlate}, parkingLotId=${parkingLotId}`);

        // Validate required parameters
        if (!licensePlate || !parkingLotId) {
            console.log('[API] Missing required parameters');
            return NextResponse.json(
                { error: "Missing required parameters" },
                { status: 400 }
            );
        }

        // Prepare data for API request
        const requestData = {
            licensePlate,
            parkingLotId
        };

        console.log(`[API] Preparing request to external API with data:`, JSON.stringify(requestData, null, 2));

        // Call API to calculate fee
        const apiUrl = `/api/entryExitLog/calculateFee`;
        console.log(`[API] Calling external API: ${apiUrl}`);

        const response = await apiFetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            const errorData = await response.json();

            console.error(`[API] External API returned error: ${response.status}`, errorData);
            return NextResponse.json(
                { error: errorData.message || "Failed to calculate fee" },
                { status: response.status }
            );
        }

        const data = await response.json();

        console.log('[API] Successfully calculated fee:', JSON.stringify(data, null, 2));

        return NextResponse.json({
            success: true,
            parkingRecord: data
        });

    } catch (error) {
        console.error("[API] Error calculating fee:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
