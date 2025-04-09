/**
 * Represents the possible statuses of a parking space
 */
export enum ParkingSpaceStatus {
  Available = 'Available',  // Space is empty and can be used
  Occupied = 'Occupied',   // Space is currently in use
  Reserved = 'Reserved',   // Space is reserved for future use
  Disabled = 'Disabled',   // Space is not available for use (maintenance, etc.)
  Pending = 'Pending'   // Space is in a transitional state (e.g., car entering/exiting)
}