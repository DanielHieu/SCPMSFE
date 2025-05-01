import { ContractStatus } from "./ContractStatus";

export interface Contract {
    licensePlate: string;
    startDate: string;
    endDate: string;
    customerName: string;
    status: ContractStatus;
    parkingSpaceId: number;
    parkingLotId: number;
    parkingSpaceName: string;
    parkingLotName: string;
    areaName: string;
    floorName: string;
    car: {
        licensePlate: string;
        make?: string;
        model?: string;
        year?: number;
        customerName?: string;
        customerId?: number;
    };
}