import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from "../../shared/header/header.component";
import { animate, state, style, transition, trigger } from '@angular/animations';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTableModule} from '@angular/material/table';
import { ChartModule } from 'primeng/chart';
import { HeaderTablePipe } from '../../shared/pipes/header-table.pipe';
import { CommonModule } from '@angular/common';
import { PercentNumberTablePipe } from '../../shared/pipes/percent-number-table.pipe';
import { ProductTaxInfo, ResponseFiles } from './taxReform';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeaderComponent, MatTableModule, MatButtonModule, MatIconModule, ChartModule, HeaderTablePipe, PercentNumberTablePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class HomeComponent implements OnInit{
  columnsToDisplay = ['tipi','classification', 'description', 'icms', 'pis', 'cofins', 'ipi'];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  expandedElement: any | null;
  showBoxListTipi: boolean = false;
  showBoxListClassification: boolean = false;
  @ViewChild('boxList') boxList!: ElementRef;
  listTipi: ProductTaxInfo[] = [];
  dataSource: ProductTaxInfo[] = [];
  listClassifications: string[] = [];
  data: ProductTaxInfo[] = [
    {
      classification: 'Alimentos',
      tipi: '1006.20.10',
      description: 'Arroz descascado (arroz cargo ou castanho) - Parboilizado',
      icms: 0.115,
      pis: 0.2,
      cofins: 0.05,
      ipi: 0.187,
      tax_reform: {
        ibs: 0.45,
        ibs_percentage_reeducation: 0.6,
        cbs: 2.75,
        cbs_percentage_reeducation: 0.4,
        is: 1
      },
      legal_basis: 'Benefício Alíquota "Zero" - Projeto da Lei Complementar n° 68/2024 - Anexo I - Produtos destinados à alimentação humana submetido à redução a zero das alíquotas do IBS e da CBS'
    },
    {
      classification: 'Alimentos',
      tipi: '1006.20.20',
      description: 'Arroz descascado (arroz cargo ou castanho) - Não parboilizado',
      icms: 0.115,
      pis: 0.2,
      cofins: 0.05,
      ipi: 0.187,
      tax_reform: {
        ibs: 0.45,
        ibs_percentage_reeducation: 0.6,
        cbs: 2.75,
        cbs_percentage_reeducation: 0.4,
        is: 1
      },
      legal_basis: 'Benefício Alíquota "Zero" - Projeto da Lei Complementar n° 68/2024 - Anexo I - Produtos destinados à alimentação humana submetido à redução a zero das alíquotas do IBS e da CBS'
    },
    {
      classification: 'Alimentos',
      tipi: '1006.30.11',
      description: 'Arroz semibranqueado ou branqueado, mesmo polido ou brunido (glaciado*) - Parboilizado - Polido ou brunido',
      icms: 0.115,
      pis: 0.2,
      cofins: 0.05,
      ipi: 0.187,
      tax_reform: {
        ibs: 0.45,
        ibs_percentage_reeducation: 0.6,
        cbs: 2.75,
        cbs_percentage_reeducation: 0.4,
        is: 1
      },
      legal_basis: 'Benefício Alíquota "Zero" - Projeto da Lei Complementar n° 68/2024 - Anexo I - Produtos destinados à alimentação humana submetido à redução a zero das alíquotas do IBS e da CBS'
    },
    {
      classification: 'Dispositivos médicos',
      tipi: '9018.90.95',
      description: 'Clipe venoso',
      icms: 0.115,
      pis: 0.2,
      cofins: 0.05,
      ipi: 0.187,
      tax_reform: {
        ibs: 0.45,
        ibs_percentage_reeducation: 0.6,
        cbs: 2.75,
        cbs_percentage_reeducation: 0.4,
        is: 1
      },
      legal_basis: 'Benefício Redução 60% Alíquota do IBS e CBS - Projeto da Lei Complementar n° 68/2024 - Anexo IV - Dispositvos Médicos Submetidos à Redução de 60% das Alíquotas de IBS e da CBS '
    }
  ]

  options: any;
  dataChart = {
    labels: [''],
    datasets: [
        {
            label: 'Sem reforma',
            backgroundColor: "#A0C4FF",
            borderColor: "#A0C4FF",
            data: [65]
        },
        {
            label: 'Com reforma',
            backgroundColor: "#1F4E79",
            borderColor: "#1F4E79",
            data: [28]
        }
    ]
  };

  ngAfterViewInit() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {3

    }
  }

  ngOnInit(): void {
    this.dataSource = this.data;
    this.getClassifications();
    const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--text-color');
      const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
      const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

      this.options = {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary,
                    font: {
                        weight: 500
                    }
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false
                }
            },
            y: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false
                }
            }

        }
      };

      this.dataChart.labels[0] = this.data[0].description;
      this.listTipi = this.dataSource;
  }

  selecItem(item: any){
    const maxLength = 50;
    this.dataChart.labels[0] = item.description.length > maxLength
      ? item.description.substring(0, maxLength) + '...'  // Limita a 100 caracteres e adiciona '...'
      : item.description;
    // this.dataChart.labels[0] = item.description;
    this.dataChart = { ...this.dataChart };
    console.log("ITEM: ", item.description)
  }

  onBlurInput(inputName: string){
    setTimeout(() => {
      if(inputName === 'tipiInput'){
        this.showBoxListTipi = false;
      }

      else if(inputName === 'classificationInput'){
        this.showBoxListClassification = false;
      }
    }, 100);
  }

  onInputChange(tipi: any){
    this.listTipi = this.data.filter((el) => el.tipi.includes(tipi))
    console.log("Event: ", this.listTipi)
  }

  onFocusInput(inputName: string){
    if(inputName === 'tipiInput'){
      this.showBoxListTipi = true;
    }

    else if(inputName === 'classificationInput'){
      this.showBoxListClassification = true;
    }
  }

  selectTipi(item: ProductTaxInfo){
    this.dataSource = [];
    this.dataSource = this.data.filter((el) => {
      console.log("El: ", el.tipi);
      console.log("Item: ", item.tipi);
      return el.tipi.includes(item.tipi);
    });
    console.log("Vendo o item: ",item)
    console.log("Vendo o array: ", this.dataSource)
  }

  selectClassification(item: string){
    this.dataSource = [];
    this.dataSource = this.data.filter((el) => {
      console.log("El: ", el);
      console.log("Item: ", item);
      return el.classification.includes(item);
    });
    console.log("Vendo o item: ",item)
    console.log("Vendo o array: ", this.dataSource)
  }

  getClassifications(){
    this.data.forEach((el) => {
      let alreadyHasClassification = false;
      this.listClassifications.forEach((elList) => {
        alreadyHasClassification = el.classification === elList;
      });

      if(!alreadyHasClassification){
        this.listClassifications.push(el.classification);
      }
    })
  }

  clearFilters(){
    this.dataSource = this.data;
    this.listTipi = this.data;
    this.listClassifications = [];
    this.getClassifications();
  }
}
