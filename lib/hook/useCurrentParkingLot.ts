import { Area, Floor, ParkingLot, ParkingSpace } from "@/types/ParkingLot";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface ParkingLotFull {
    parkingLot?: ParkingLot;
    areas: Area[];
    floors: Floor[];
    parkingSpaces: ParkingSpace[];
}

export const useCurrentParkingLot = () => {
    const { data: session } = useSession();
    const [parkingLotFull, setParkingLotFull] = useState<ParkingLotFull | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchParkingLotFull = () => {
        fetch(process.env.NEXT_PUBLIC_API_LOCAL_URL + "/api/parking-lot/full",
            {
                cache: "no-store"
            }
        )
            .then(res => res.json())
            .then(data => {
                setParkingLotFull(data.data);
            })
            .catch(err => {
                setError(err.message);
            });
    }


    useEffect(() => {
        if (parkingLotFull) return;

        if (session?.user) {
            fetchParkingLotFull();
        }
    }, [session, parkingLotFull]);

    return { parkingLotFull, error, fetchParkingLotFull };
}