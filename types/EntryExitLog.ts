interface EntryExitLog {
  id: string;
  licensePlate: string;
  rentalType: string;
  totalAmount: number;
  entryTime: string;
  exitTime: string | null;
  parkingSpaceName: string;
  parkingSpaceStatus: string;
  isPaid: boolean;
}