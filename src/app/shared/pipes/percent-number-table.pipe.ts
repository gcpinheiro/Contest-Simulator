import { Pipe, PipeTransform } from '@angular/core';
import { isNumber } from 'util';

@Pipe({
  name: 'percentMask',
  standalone: true
})
export class PercentMaskPipe  implements PipeTransform {

  transform(value: any): string {
    if (value != null) {
      const formattedValue = parseFloat(value).toFixed(2); // Formatação de até 2 casas decimais
      return `${formattedValue}%`;
    }
    return value;
  }

}
