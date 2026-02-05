export interface Location {
    id: string;
    code: string;
    description?: string;
    parentId: string | null;
    type: 'SITE' | 'AREA' | 'AISLE' | 'RACK' | 'LEVEL' | 'BIN';
    status: 'FREE' | 'OCCUPIED' | 'BLOCKED';
    currentVolume: number;
    capacityVolume?: number;
}

export interface Item {
    id: string;
    internalCode: string;
    description: string;
    category: string;
    unitOfMeasure: string;
    reorderPoint: number;
}

export interface StockDetail {
    id: string;
    itemCode: string;
    locationCode: string;
    quantity: number;
    status: 'AVAILABLE' | 'ALLOCATED' | 'BLOCKED';
}

export interface StockSummary {
    itemCode: string; // Group by item
    description: string;
    totalQuantity: number;
    locationsCount: number;
}

export interface Activity {
    id: string;
    itemCode: string;
    type: string;
    quantity: number;
    sourceLocation?: string;
    targetLocation?: string;
    timestamp: string;
    description: string;
}

export interface ZoneCapacity {
    zoneName: string;
    percentage: number;
}
