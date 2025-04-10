import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { ParkingLotPrice } from '@/lib/hook/useParkingLotPrice';
import { apiFetch } from '@/lib/utils/api';

export async function GET() {
    try {
        console.log('[API] GET /api/parking-lot/price - Request received');

        // Get the user session
        const session = await getServerSession(authOptions);

        console.log('[API] Session data:', JSON.stringify(session, null, 2));

        // Check if user is authenticated and has parkingLot information
        if (!session?.user || !('parkingLot' in session.user)) {
            console.log('[API] Authentication failed - User not authenticated or missing parking lot info');
            return NextResponse.json(
                {
                    success: false,
                    message: 'Unauthorized or missing parking lot information'
                },
                { status: 401 }
            );
        }

        // Extract parking lot ID from the session
        const parkingLot = session.user.parkingLot as { parkingLotId: number };
        const parkingLotId = parkingLot.parkingLotId;
        console.log(`[API] Processing request for parking lot ID: ${parkingLotId}`);

        // Make request to the external API
        const requestUrl = '/api/parkinglot/getById?id=' + parkingLotId;
        console.log(`[API] Fetching data from external API: ${requestUrl}`);

        const response = await apiFetch(requestUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        console.log('[API] External API response:', JSON.stringify(data, null, 2));

        if (data) {
            // Format the price data
            const priceData: ParkingLotPrice = {
                pricePerHour: data?.pricePerHour || 0,
                pricePerDay: data?.pricePerDay || 0,
                pricePerMonth: data?.pricePerMonth || 0
            };
            console.log('[API] Successfully retrieved price data:', JSON.stringify(priceData, null, 2));

            return NextResponse.json({
                success: true,
                data: priceData
            });
        } else {
            // Return default values if API call was not successful
            console.log('[API] External API call failed with message:', data.message || 'No error message provided');
            return NextResponse.json({
                success: false,
                message: 'Failed to fetch parking lot price data',
                data: {
                    pricePerHour: 0,
                    pricePerDay: 0,
                    pricePerMonth: 0
                }
            });
        }
    } catch (error) {
        console.error('[API] Error fetching parking lot price:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error',
                data: {
                    pricePerHour: 0,
                    pricePerDay: 0,
                    pricePerMonth: 0
                }
            },
            { status: 500 }
        );
    }
}
