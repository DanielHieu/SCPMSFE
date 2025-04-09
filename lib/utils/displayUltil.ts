export const toRentalTypeDisplay = (rentalType: string) => {
    switch (rentalType) {
        case "Walkin":
            return "Vãng lai";
        case "Contract":
            return "Hợp đồng";
        default:
            return rentalType;
    }
}
