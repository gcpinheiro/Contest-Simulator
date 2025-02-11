import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { url } from 'inspector';
import { Observable } from 'rxjs/internal/Observable';
import { ResponseReport } from './home';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(private http: HttpClient) { }

  getData(id:string, classification: string, page: number, size: number, operation: string | null): Observable<any> {
    let url = 'http://localhost:3000/ncm';
    let params = new HttpParams()
      .set('classification', classification.toString())
      .set('page', page.toString())
      .set('limit', size.toString());
    console.log("Fora do if: ", !!operation, typeof operation)
    if(!!operation){
      params = params.set('operation', operation)
      console.log("Entrou no if: ", params)
    }

    return this.http.get(`${url}/${id}`, { params });
  }

  uploadFileRules(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post('http://localhost:3000/ncm/import-rules', formData);
  }

  uploadFileReport(file: File, aliquota: number, ibs: number, cbs: number, is: number): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('aliquota', aliquota.toString());
    formData.append('ibs', ibs.toString());
    formData.append('cbs', cbs.toString());
    formData.append('is', is.toString());

    return this.http.post<ResponseReport>('http://localhost:3000/ncm/import-report', formData);
  }
}
