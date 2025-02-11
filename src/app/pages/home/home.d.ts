export interface ResponseReport{
  _id: string;
  classifications: Classification[];
}

export interface Classification{
  name: string;
  totalEntrada: number;
  totalSaida: number;
  totalImpostoCbs: number;
  totalImpostoIbs: number;
  totalImpostoIs: number;
}

export interface Ncm{
  OPERATION: string;
  CLASSIFICATION: string;
  NCM: string;
  DESCRIPTION: string;
  VALUE: number | string;
  PIS: string;
  CONFINS: string;
  IPI: string;
  ISS: string;
  IBS: string;
  CBS: string;
  IS: string;
  reductions: Reduction;
}

export interface Reduction {
  reduction_ibs: string;
  reduction_cbs: string;
  reduction_is: string;
}

export interface Report {
  reportId: string;
  classification: string;
  operation: string;
  totalNcms: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  ncms: Ncm[];
  currentOperation: null | string;
}
