// POS Product Form Data Type
export interface PosProductFormData {
  itemName: string;
  category: string;
  itemCode: string;
  barcode: string;
  brand: string;
  uom: string;
  purchasePrice: number;
  sellingPrice: number;
  mrp: number;
  gstPercentage: number;
  hsnCode: string;
  discountType: string;
  discountValue: number;
  warehouse: string;
  openingStock: number;
  quantity: number;
  lowStockAlertLevel: number;
  status: string;
  display: string;
  expiryDate: Date | undefined;
  mfgDate: Date | undefined;
  batchNo: string;
  safetyInformation: string;
  description: string;
  itemImage: string | File;
}

// Product Response Type
export interface PosProduct extends PosProductFormData {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Product Filter Type
export interface ProductFilter {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}
