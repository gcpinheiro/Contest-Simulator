import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { url } from 'inspector';
import { Observable } from 'rxjs/internal/Observable';
import { ResponseReport } from './home';
import {environment} from './../../../environments/environment.prod'
@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(private http: HttpClient) { }

  getData(id:string, classification: string, page: number, size: number, operation: string): Observable<any> {
    let params = new HttpParams()
      .set('classification', classification.toString())
      .set('page', page.toString())
      .set('limit', size.toString());
    if(operation !== 'Todas' && !!operation){
      params = params.set('operation', operation)
    }

    return this.http.get(`${environment.baseUrl}/ncm/${id}`, { params });
  }

  uploadFileRules(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${environment.baseUrl}/ncm/import-rules`, formData);
  }

  uploadFileReport(file: File, aliquota: number, ibs: number, cbs: number, is: number): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('aliquota', aliquota.toString());
    formData.append('ibs', ibs.toString());
    formData.append('cbs', cbs.toString());
    formData.append('is', is.toString());

    return this.http.post<ResponseReport>(`${environment.baseUrl}/ncm/import-report`, formData);
  }

  updateAliquotas(reportId: string, aliquota: number, ibs: number, cbs: number, is: number): Observable<any> {
    const formData = new FormData();
    formData.append('reportId', reportId);
    formData.append('aliquota', aliquota.toString());
    formData.append('ibs', ibs.toString());
    formData.append('cbs', cbs.toString());
    formData.append('is', is.toString());

    return this.http.post<ResponseReport>(`${environment.baseUrl}/ncm/import-report`, formData);
  }
}
