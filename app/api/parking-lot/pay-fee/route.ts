import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { apiFetch } from '@/lib/utils/api';

export async function POST(request: NextRequest) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    try {
        console.log('[API] GET /api/parking-lot/pay-fee - Request received');

        // Check authentication
        const session = await getServerSession(authOptions);
        console.log('[API] Session data:', JSON.stringify(session, null, 2));

        if (!session) {
            console.log('[API] Authentication failed - User not authenticated');
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        // Get entryExitId from query parameters
        // For POST requests, we'll get exitImage from the body instead of query params
        const body = await request.json();
        const exitImage = body.exitImage;
        const entryExitId = body.entryExitId;
        
        console.log(`[API] Request body contains exitImage: ${exitImage ? 'Yes' : 'No'}`);

        if (!entryExitId) {
            console.log('[API] Missing required parameter: entryExitId');
            return NextResponse.json({ success: false, message: 'Missing entryExitId parameter' }, { status: 400 });
        }

        // Call the API to pay the fee
        const apiUrl = `/api/EntryExitLog/pay/${entryExitId}`;
        console.log(`[API] Calling external API: ${apiUrl}`);

        const response = await apiFetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                exitImage: exitImage
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`[API] External API returned error: ${response.status}`, errorData);
            return NextResponse.json({
                success: false,
                message: errorData.message || 'Failed to process payment'
            }, { status: response.status });
        }

        const data = await response.json();
        console.log('[API] Payment processed successfully:', JSON.stringify(data, null, 2));
        return NextResponse.json({ success: true, data: data });

    } catch (error) {
        console.error('[API] Error in pay-fee API route:', error);
        return NextResponse.json({
            success: false,
            message: 'An error occurred while processing the payment'
        }, { status: 500 });
    }
}
