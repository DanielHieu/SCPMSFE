import { ParkingSpaceStatus } from "./ParkingSpaceStatus";
import { RentalType } from "./RentalType";

export interface ParkingLot {
    parkingLotId: number;
    name: string;
    parkingLotName: string;
    address: string;
}

export interface Area {
    areaId: number;
    areaName: string;
    parkingLotId: number;
    rentalType: RentalType;
}

export interface Floor {
    floorId: number;
    floorName: string;
    areaId: number;
}

export interface ParkingSpace {
    parkingSpaceId: number;
    parkingSpaceName: string;
    status: ParkingSpaceStatus;
    floorId: number;
}


