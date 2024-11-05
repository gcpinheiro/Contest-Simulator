import { Component } from '@angular/core';
import { HeaderComponent } from "../../shared/header/header.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  mock = [
    {
      classification: 'Alimentos',
      tipi: '1006.20.10',
      description: 'Arroz descascado (arroz cargo ou castanho) - Parboilizado',
      icms: 0,
      pis: 0,
      cofins: 0,
      ipi: 0,
      tax_reform: {
        ibs: 0,
        ibs_Percentage_Reeducation: 0,
        cbs: 0,
        cbs_Percentage_Reeducation: 0,
        is: 0
      },
      legal_basis: 'Benefício Alíquota "Zero" - Projeto da Lei Complementar n° 68/2024 - Anexo I - Produtos destinados à alimentação humana submetido à redução a zero das alíquotas do IBS e da CBS'
    }
  ]
}
