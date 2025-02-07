export interface ResponseReport{
  _id: string;
  classifications: string[];
}

export interface DataReport{
  classification: string;
  reportId: string;
  classification: string;
  totalNcms: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  ncm: Ncm[];
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
  reductions: {
    reduction_ibs: string;
    reduction_cbs: string;
    reduction_is: string;
  };
}
