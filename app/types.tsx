export type UserRole = 'client' | 'supplier' | null;

export enum OrderStatusId {
    TO_BE_SUBMITTED = 1,
    SUBMITTED = 2,
    CHECKING = 3,
    REVIEW_NEEDED = 4,
    IN_PRODUCTION = 5,
    SHIPPED = 6,
    REVIEW_COMPLETED = 7
}

// Map the ID to the Display Name
export const OrderStatusLabels: Record<number, string> = {
    [OrderStatusId.TO_BE_SUBMITTED]: "To be submitted",
    [OrderStatusId.SUBMITTED]: "Submitted",
    [OrderStatusId.CHECKING]: "Checking",
    [OrderStatusId.REVIEW_NEEDED]: "Review Needed",
    [OrderStatusId.IN_PRODUCTION]: "In production",
    [OrderStatusId.SHIPPED]: "Shipped",
    [OrderStatusId.REVIEW_COMPLETED]: "Review completed",
};