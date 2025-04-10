import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { apiFetch } from '@/lib/utils/api';

export async function GET(request: NextRequest) {

    try {
        console.log('[API] GET /api/contracts/license-plate - Request received');
        // Get the user session
        const session = await getServerSession(authOptions);
        console.log('[API] Session user:', session?.user?.email);

        // Get the license plate from the query string
        const { searchParams } = new URL(request.url);
        const licensePlate = searchParams.get('licensePlate');
        console.log('[API] License plate query:', licensePlate);

        if (!licensePlate) {
            console.log('[API] Error: License plate is required');
            return NextResponse.json(
                {
                    success: false,
                    message: 'License plate is required'
                },
                { status: 400 }
            );
        }

        console.log('[API] Fetching contract for license plate:', licensePlate, 'and parking lot:', session?.user?.parkingLot?.parkingLotId);
        // Find the contract with the matching license plate
        const response = await apiFetch("/api/contract/getByLicensePlateAndParkingLot", {
            method: 'POST',
            body: JSON.stringify({
                licensePlate: licensePlate,
                parkingLotId: session?.user?.parkingLot?.parkingLotId
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('[API] Response status:', response.status);

        const data = await response.json();
        console.log('[API] Contract found:', data?.contract ? 'Yes' : 'No');

        if (!data?.contract) {
            console.log('[API] No contract found for license plate:', licensePlate);
            return NextResponse.json(
                {
                    success: true,
                    message: 'No contract found for this license plate',
                    contract: null
                },
                { status: 200 }
            );
        }

        console.log('[API] Successfully retrieved contract for license plate:', licensePlate);

        return NextResponse.json({ success: true, contract: data.contract });
    } catch (error) {
        console.error('[API] Error fetching contract:', error);

        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
