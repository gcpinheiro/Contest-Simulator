import { Pipe, PipeTransform } from '@angular/core';
import { isNumber } from 'util';

@Pipe({
  name: 'percentNumberTable',
  standalone: true
})
export class PercentNumberTablePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    if (typeof value === 'number' && !isNaN(value)) {
      return `${(value * 100)}%`;
    } else {
      return '0%';
    }
  }

}
