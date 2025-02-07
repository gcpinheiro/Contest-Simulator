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

  getData(id:string, classification: string, page: number, size: number): Observable<any> {
    let url = 'http://localhost:3000/ncm';
    let params = new HttpParams()
      .set('classification', classification.toString())
      .set('page', page.toString())
      .set('limit', size.toString());

    return this.http.get(`${url}/${id}`, { params });
  }

  uploadFileRules(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post('http://localhost:3000/ncm/import-rules', formData);
  }

  uploadFileReport(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ResponseReport>('http://localhost:3000/ncm/import-report', formData);
  }
}
