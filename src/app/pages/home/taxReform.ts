export interface TaxReform {
  ibs: number;
  ibs_percentage_reeducation: number;
  cbs: number;
  cbs_percentage_reeducation: number;
  is: number;
}

export interface ProductTaxInfo {
  classification: string;
  tipi: string;
  description: string;
  icms: number;
  pis: number;
  cofins: number;
  ipi: number;
  tax_reform: TaxReform;
  legal_basis: string;
}

export interface ResponseFiles{
  data: ProductTaxInfo[];
}
