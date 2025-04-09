"use client"
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react"

export interface ParkingLotPrice {
    pricePerHour: number,
    pricePerDay: number,
    pricePerMonth: number
}

export const useParkingLotPrice = () => {
    const { data: session } = useSession();

    const [price, setPrice] = useState<ParkingLotPrice>({
        pricePerHour: 0,
        pricePerDay: 0,
        pricePerMonth: 0
    })

    useEffect(() => {
        console.log("useParkingLotPrice", session);
        if (session?.user && 'parkingLot' in session.user) {

            const requestUrl = process.env.NEXT_PUBLIC_API_LOCAL_URL + '/api/parking-lot/price';
            console.log("requestUrl", requestUrl);
            
            fetch(requestUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
                .then(response => response.json())
                .then(result => {
                    console.log("useParkingLotPrice", result?.data);

                    if (result.success) {
                        setPrice({
                            pricePerHour: result?.data?.pricePerHour || 0,
                            pricePerDay: result?.data?.pricePerDay || 0,
                            pricePerMonth: result?.data?.pricePerMonth || 0
                        })
                    } else {
                        setPrice({
                            pricePerHour: 0,
                            pricePerDay: 0,
                            pricePerMonth: 0
                        });
                    }
                })
                .catch(error => {
                    console.error(error)

                    setPrice({
                        pricePerHour: 0,
                        pricePerDay: 0,
                        pricePerMonth: 0
                    })
                })
        }
    }, [session]);

    return price
}