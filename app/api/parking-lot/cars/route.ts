import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/authOptions";
import { getServerSession } from "next-auth";
import { EntrancingCar } from "@/types/EntrancingCar";

export async function GET() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    
    try {
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
        
        // Get query parameters
        const parkingLotId = session.user.parkingLot?.parkingLotId;
        console.log('[API] Parking lot ID:', parkingLotId);
        // Get all cars currently in the parking lot (with check-in but no check-out)
        const response = await fetch(process.env.API_URL + "/api/EntryExitLog/GetEntrancingCars/" + parkingLotId);
        const data = await response.json();

        console.log('[API] Data:', JSON.stringify(data, null, 2));

        const carsInParkingLot = data || ([] as EntrancingCar[]);

        console.log('[API] Cars in parking lot:', JSON.stringify(carsInParkingLot, null, 2));

        return NextResponse.json({
            success: true,
            carsInParkingLot
        });
    } catch (error) {
        console.error("Error fetching cars in parking lot:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch cars in parking lot",
                error: (error as Error).message
            },
            { status: 500 }
        );
    }
}
