import { RentalType } from '@/types/RentalType';
import { NextResponse } from 'next/server';
import { apiFetch } from '@/lib/utils/api';

export async function POST(request: Request) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    
    try {
        console.log('[API] POST /api/parking-lot/entrance - Request received');

        // Parse the request body
        const body = await request.json();
        const { licensePlate, parkingSpaceId, rentalType } = body;

        // Validate input
        if (!licensePlate || !parkingSpaceId) {
            return NextResponse.json(
                { error: "License plate and parking space ID are required" },
                { status: 400 }
            );
        }

        // Make request to the external API
        const apiUrl = `/api/entryexitlog/add`;
        console.log(`[API] Calling external API: ${apiUrl}`);

        const response = await apiFetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                licensePlate,
                parkingSpaceId,
                rentalType: rentalType === RentalType.Walkin ? 1 : 2
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`[API] External API returned error: ${response.status}`, errorData);
            return NextResponse.json(
                { error: errorData.message || "Failed to process entrance" },
                { status: response.status }
            );
        }

        const data = await response.json();
        
        console.log('[API] Successfully processed entrance:', JSON.stringify(data, null, 2));

        return NextResponse.json({
            success: true,
            data: data
        });

    } catch (error) {
        console.error("[API] Error processing entrance:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
