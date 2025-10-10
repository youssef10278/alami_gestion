// Types pour le système de sauvegarde et importation

export interface BackupMetadata {
  version: string
  exported_at: string
  app_version: string
  total_records: number
  compressed: boolean
  checksum?: string
}

export interface BackupCompanyData {
  settings: {
    id: string
    companyName: string
    companyAddress?: string
    companyPhone?: string
    companyEmail?: string
    companyLogo?: string
    primaryColor?: string
    secondaryColor?: string
    accentColor?: string
    currency?: string
    taxRate?: number
    createdAt: string
    updatedAt: string
  }
  users: Array<{
    id: string
    name: string
    email: string
    role: string
    createdAt: string
    updatedAt: string
    // Note: password exclu pour sécurité
  }>
}

export interface BackupProductData {
  id: string
  name: string
  sku: string
  description?: string
  category?: string
  purchasePrice: number
  price: number
  stock: number
  minStock: number
  maxStock?: number
  unit?: string
  barcode?: string
  image?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface BackupCustomerData {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  company?: string
  creditLimit?: number
  creditUsed?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  // Relations imbriquées
  sales: Array<{
    id: string
    saleNumber: string
    totalAmount: number
    paidAmount: number
    creditAmount: number
    paymentMethod: string
    status: string
    notes?: string
    createdAt: string
    items: Array<{
      id: string
      productId: string
      productName: string
      productSku?: string
      quantity: number
      unitPrice: number
      total: number
    }>
  }>
}

export interface BackupSupplierData {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  company?: string
  taxId?: string
  totalDebt: number
  totalPaid: number
  balance: number
  notes?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  // Relations imbriquées
  transactions: Array<{
    id: string
    transactionNumber: string
    type: string
    amount: number
    description: string
    date: string
    status: string
    paymentMethod?: string
    notes?: string
    createdAt: string
    updatedAt: string
    checks: Array<{
      id: string
      checkNumber: string
      amount: number
      date: string
      status: string
      bankName?: string
      notes?: string
    }>
  }>
}

export interface BackupStandaloneSale {
  id: string
  saleNumber: string
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  totalAmount: number
  paidAmount: number
  creditAmount: number
  paymentMethod: string
  status: string
  notes?: string
  createdAt: string
  sellerId: string
  sellerName: string
  items: Array<{
    id: string
    productId: string
    productName: string
    productSku?: string
    quantity: number
    unitPrice: number
    total: number
  }>
}

export interface BackupInvoiceData {
  id: string
  invoiceNumber: string
  customerId?: string
  customerName: string
  totalAmount: number
  paidAmount: number
  status: string
  dueDate?: string
  notes?: string
  createdAt: string
  items: Array<{
    id: string
    productId: string
    productName: string
    productSku?: string
    quantity: number
    unitPrice: number
    total: number
  }>
}

export interface BackupQuoteData {
  id: string
  quoteNumber: string
  customerId?: string
  customerName: string
  customerPhone?: string
  customerEmail?: string
  customerAddress?: string
  totalAmount: number
  status: string
  validUntil?: string
  notes?: string
  terms?: string
  createdAt: string
  items: Array<{
    id: string
    productId: string
    productName: string
    productSku?: string
    quantity: number
    unitPrice: number
    total: number
  }>
}

export interface BackupData {
  metadata: BackupMetadata
  company: BackupCompanyData
  data: {
    products: BackupProductData[]
    customers: BackupCustomerData[]
    suppliers: BackupSupplierData[]
    standalone_sales: BackupStandaloneSale[]
    invoices: BackupInvoiceData[]
    quotes: BackupQuoteData[]
  }
}

// Types pour l'import
export interface ImportResult {
  success: boolean
  message: string
  stats: {
    products_imported: number
    customers_imported: number
    suppliers_imported: number
    sales_imported: number
    invoices_imported: number
    quotes_imported: number
    errors: number
  }
  errors: string[]
}

export interface ImportOptions {
  merge_strategy: 'replace' | 'merge' | 'skip'
  validate_relations: boolean
  create_backup_before_import: boolean
}
