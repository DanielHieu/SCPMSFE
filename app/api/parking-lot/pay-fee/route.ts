import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';

export async function GET(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        // Get entryExitId from query parameters
        const searchParams = request.nextUrl.searchParams;
        const entryExitId = searchParams.get('entryExitId');

        if (!entryExitId) {
            return NextResponse.json({ success: false, message: 'Missing entryExitId parameter' }, { status: 400 });
        }

        // Call the API to pay the fee
        const response = await fetch(`${process.env.API_URL}/api/EntryExitLog/pay/${entryExitId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json({
                success: false,
                message: errorData.message || 'Failed to process payment'
            }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json({ success: true, data });

    } catch (error) {
        console.error('Error in pay-fee API route:', error);
        return NextResponse.json({
            success: false,
            message: 'An error occurred while processing the payment'
        }, { status: 500 });
    }
}
