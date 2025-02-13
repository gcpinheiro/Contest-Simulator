import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'headerTable',
  standalone: true
})
export class HeaderTablePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {

    switch(value){
      case 'tipi': return 'NCM TIPI';
      case 'classification': return 'Classificação';
      case 'description': return 'Descrição do produto';
      case 'icms': return 'ICMS';
      case 'pis': return 'PIS';
      case 'cofins': return 'COFINS';
      case 'ipi': return 'IPI';
      case 'input': return 'E/S'
      case 'value': return 'Valor'
      case 'ibs': return 'IBS'
      case 'cbs': return 'CBS'
      case 'is': return 'IS'
      case 'iss': return 'ISS'
      case 'total': return 'Total'

    }
    return null;
  }

}
