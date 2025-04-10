import { NextResponse } from 'next/server';
import { apiFetch } from '@/lib/utils/api';

export async function GET() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    try {
        console.log('[API] GET /api/parking-lot - Request received');

        // Make request to the external API
        const apiUrl = `/api/parkinglot/search`;
        console.log(`[API] Calling external API: ${apiUrl}`);

        const response = await apiFetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                keyword: ""
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`[API] External API returned error: ${response.status}`, errorData);
            return NextResponse.json(
                { error: errorData.message || "Failed to fetch parking lots" },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log('[API] Successfully retrieved parking lots:', JSON.stringify(data, null, 2));

        return NextResponse.json({
            success: true,
            data: data
        });

    } catch (error) {
        console.error("[API] Error fetching parking lots:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
