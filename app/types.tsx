export type UserRole = 'client' | 'supplier' | null;

export enum OrderStatusId {
    CANCELED = 1,
    UNREAD = 2,
    READ = 3,
    IN_PRODUCTION = 4,
    SHIPPED = 5,
    REVIEW_REQUESTED = 6
}

// Map the ID to the Display Name
export const OrderStatusLabels: Record<number, string> = {
    [OrderStatusId.CANCELED]: "canceled",
    [OrderStatusId.UNREAD]: "unread",
    [OrderStatusId.READ]: "read",
    [OrderStatusId.IN_PRODUCTION]: "in production",
    [OrderStatusId.SHIPPED]: "shipped",
    [OrderStatusId.REVIEW_REQUESTED]: "review requested",
};