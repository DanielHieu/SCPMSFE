import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { apiFetch } from '@/lib/utils/api';

export async function GET(request: NextRequest) {
    try {
        // Get the session to retrieve the parking lot ID
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get the parking lot ID from the session
        const parkingLotId = session.user.parkingLot?.parkingLotId;

        if (!parkingLotId) {
            return NextResponse.json(
                { error: 'Parking lot ID not found in session' },
                { status: 400 }
            );
        }

        // Make request to external API
        const response = await apiFetch('/api/entryExitLog/Search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                keyword: '',
                parkingLotId: parkingLotId
            }),
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        return NextResponse.json({ logs: data });
    } catch (error) {
        console.error('Error fetching parking logs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch parking logs' },
            { status: 500 }
        );
    }
}
