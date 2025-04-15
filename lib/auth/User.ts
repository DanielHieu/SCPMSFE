import { ParkingLot } from "@/types/ParkingLot";
import { DefaultUser } from "next-auth";

/**
 * Extends the default NextAuth User type to include additional properties
 * needed for our parking management system.
 */
export interface User extends DefaultUser {
    id: string;
    name: string;
    email: string;
    image?: string;
    role?: string;
    parkingLot?: ParkingLot;
    permissions?: string[];
    username?: string;
}

/**
 * Type for user authentication credentials
 */
export interface UserCredentials {
    id: string;
    username: string;
    password: string;
    parkingLotId?: number;
}