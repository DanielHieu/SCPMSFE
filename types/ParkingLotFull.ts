import { Area, Floor, ParkingLot, ParkingSpace } from "./ParkingLot";

export interface ParkingLotFull extends ParkingLot {
    areas: Area[];
    floors: Floor[];
    parkingSpaces: ParkingSpace[];
}