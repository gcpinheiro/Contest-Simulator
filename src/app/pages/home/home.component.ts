import { Component, ElementRef, HostListener, inject, OnInit, Renderer2, ViewChild } from '@angular/core';
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
import { FormsModule } from '@angular/forms';
type columnName = 'input' |'tipi' |'classification' | 'description' | 'ibs' | 'cbs' | 'is'| 'value'| 'pis'| 'cofins'| 'ipi' | 'icms' ;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    ChartModule,
    HeaderTablePipe,
    PercentNumberTablePipe,
    FormsModule
  ],
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
  private renderer2 = inject(Renderer2);
  file: File | null = null;
  columnsToDisplay: columnName[] = ['input','tipi','classification', 'description', 'ibs' , 'cbs' , 'is', 'value'];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  expandedElement: any | null;
  showBoxListTipi: boolean = false;
  showBoxListClassification: boolean = false;
  showBoxListDescription: boolean = false;
  @ViewChild('inputRefTipi') inputRefTipi!: ElementRef;
  @ViewChild('inputRefClassification') inputRefClassification!: ElementRef;
  @ViewChild('inputRefDescription') inputRefDescription!: ElementRef;
  @ViewChild('arrowDropdown') arrowDropdown!: ElementRef;
  listTipi: ProductTaxInfo[] = [];
  dataSource: ProductTaxInfo[] = [];
  listClassifications: string[] = [];
  listDescriptions: ProductTaxInfo[] = [];
  currentItem: ProductTaxInfo = {} as ProductTaxInfo;
  currentTab = 'home';
  hasSorted = {
    icms: false,
    pis: false,
    ipi: false,
    cofins: false,
    classification: false,
    input: false,
    tipi: false,
    description: false,
    value: false,
    ibs: false,
    cbs: false,
    is: false
  }
  data: ProductTaxInfo[] = [
    {
      input: 'Entradas',
      classification: 'Alimentos',
      tipi: '1006.20.10',
      description: 'Arroz descascado (arroz cargo ou castanho) - Parboilizado',
      icms: 0.915,
      value: 100,
      pis: 0.2,
      cofins: 0.95,
      ipi: 0.687,
      ibs: 0.15,
      ibs_percentage_reeducation: 0.6,
      cbs: 2.75,
      cbs_percentage_reeducation: 0.4,
      is: 1,
      legal_basis: 'Benefício Alíquota "Zero" - Projeto da Lei Complementar n° 68/2024 - Anexo I - Produtos destinados à alimentação humana submetido à redução a zero das alíquotas do IBS e da CBS'
    },
    {
      input: 'Entradas',
      classification: 'Alimentos',
      tipi: '1006.20.20',
      description: 'Arroz descascado (arroz cargo ou castanho) - Não parboilizado',
      icms: 0.515,
      pis: 0.3,
      cofins: 0.15,
      ipi: 0.187,
      value: 30.87,
      ibs: 0.45,
      ibs_percentage_reeducation: 0.6,
      cbs: 2.75,
      cbs_percentage_reeducation: 0.4,
      is: 1,
      legal_basis: 'Benefício Alíquota "Zero" - Projeto da Lei Complementar n° 68/2024 - Anexo I - Produtos destinados à alimentação humana submetido à redução a zero das alíquotas do IBS e da CBS'
    },
    {
      input: 'Saídas',
      classification: 'Alimentos',
      tipi: '1006.30.11',
      description: 'Arroz semibranqueado ou branqueado, mesmo polido ou brunido (glaciado*) - Parboilizado - Polido ou brunido',
      icms: 0.215,
      pis: 0.5,
      cofins: 0.75,
      ipi: 0.467,
      value: 21.45,
      ibs: 0.45,
      ibs_percentage_reeducation: 0.6,
      cbs: 2.75,
      cbs_percentage_reeducation: 0.4,
      is: 1,
      legal_basis: 'Benefício Alíquota "Zero" - Projeto da Lei Complementar n° 68/2024 - Anexo I - Produtos destinados à alimentação humana submetido à redução a zero das alíquotas do IBS e da CBS'
    },
    {
      input: 'Saídas',
      classification: 'Dispositivos médicos',
      tipi: '9018.90.95',
      description: 'Clipe venoso',
      icms: 0.415,
      pis: 0.8,
      cofins: 0.25,
      ipi: 0.987,
      value: 1451.24,
      ibs: 0.45,
      ibs_percentage_reeducation: 0.6,
      cbs: 2.75,
      cbs_percentage_reeducation: 0.4,
      is: 1,
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
    this.listDescriptions = this.data;
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

  selecItem(item: ProductTaxInfo){
    const maxLength = 50;
    if(this.currentItem.tipi !== item.tipi){
      this.dataChart.labels[0] = item.description.length > maxLength
      ? item.description.substring(0, maxLength) + '...'
      : item.description;
      this.dataChart = { ...this.dataChart };
      this.currentItem = item;
    }
  }

  onBlurInput(inputName: string){
    setTimeout(() => {
      if(inputName === 'tipiInput'){
        this.showBoxListTipi = false;
      }

      else if(inputName === 'classificationInput'){
        this.showBoxListClassification = false;
      }
      else if(inputName === 'descriptionInput'){
        this.showBoxListDescription = false;
      }
    }, 100);
  }

  onInputChange(tipi: any){
    this.listTipi = this.dataSource.filter((el) => el.tipi.includes(tipi))
  }

  onInputChangeDescription(value: any){
    this.listDescriptions = this.dataSource.filter((el) => el.description.includes(value))
  }

  onFocusInput(inputName: string){
    if(inputName === 'tipiInput'){
      this.listTipi = this.dataSource.filter((el) => el.tipi.includes(''))
      this.showBoxListTipi = true;
    }

    else if(inputName === 'classificationInput'){
      this.showBoxListClassification = true;
    }

    else if(inputName === 'descriptionInput'){
      this.listDescriptions = this.dataSource.filter((el) => el.description.includes(''))
      this.showBoxListDescription = true;
    }
  }

  selectTipi(item: ProductTaxInfo){
    this.dataSource = [];
    this.dataSource = this.data.filter((el) => {
      return el.tipi.includes(item.tipi);
    });
    this.renderer2.setProperty( this.inputRefTipi.nativeElement,'value', item.tipi)
  }

  selectClassification(item: string){
    if(this.inputRefDescription.nativeElement.value.length > 0 || this.inputRefTipi.nativeElement.value.length > 0){
      this.renderer2.setProperty( this.inputRefTipi.nativeElement,'value', '')
      this.renderer2.setProperty( this.inputRefDescription.nativeElement,'value', '')
    }
    this.dataSource = [];
    this.dataSource = this.data.filter((el) => {
      return el.classification.includes(item);
    });
    this.renderer2.setProperty( this.inputRefClassification.nativeElement,'value', item)
  }

  selectDescription(item: ProductTaxInfo){
    this.dataSource = [];
    this.dataSource = this.data.filter((el) => {
      return el.description.includes(item.description);
    });
    this.renderer2.setProperty( this.inputRefDescription.nativeElement,'value', item.description)
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
    this.listDescriptions = [];
    this.getClassifications();
    this.renderer2.setProperty( this.inputRefClassification.nativeElement,'value', '')
    this.renderer2.setProperty( this.inputRefTipi.nativeElement,'value', '')
    this.renderer2.setProperty( this.inputRefDescription.nativeElement,'value', '')
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];

    if (file) {
      this.file = file;
      console.log('Arquivo selecionado:', file.name);
    } else {
      console.error('Nenhum arquivo selecionado.');
    }
  }

  sortByColumn(columnName: columnName){
    console.log("columnName: ", columnName)
    const data = this.dataSource;
    this.dataSource = [];

    if(columnName === 'ipi' || columnName === 'value' || columnName === 'cofins' || columnName === 'pis' || columnName === 'icms' || columnName === 'ibs' || columnName === 'cbs' || columnName === 'is'){
      if(this.hasSorted[columnName]){
        this.dataSource = [...data.sort((a, b) => Number(b[columnName]) - Number(a[columnName]))];
      }
      else{
        this.dataSource = [...data.sort((a, b) => Number(a[columnName]) - Number(b[columnName]))];
      }
      this.hasSorted[columnName] = !this.hasSorted[columnName];
    }

    else{
      if(this.hasSorted[columnName]){
        this.dataSource = [...data.sort((a, b) => a[columnName].localeCompare(b[columnName]))];
      }
      else{
        this.dataSource = [...data.sort((a, b) => b[columnName].localeCompare(a[columnName]))];
      }
      this.hasSorted[columnName] = !this.hasSorted[columnName];
    }
  }

  toggleTab(tab: string){
    this.currentTab = tab;
  }

  dropdownStates: { [key: number]: boolean } = {};

  toggleDropdown(index: number, el: any): void {
    if(!this.dropdownStates[index]){
      this.renderer2.setStyle( this.arrowDropdown.nativeElement,'transform', 'rotate(180deg)')
    }

    else{
      this.renderer2.setStyle( this.arrowDropdown.nativeElement,'transform', 'rotate(0deg)')
    }

    this.dropdownStates[index] = !this.dropdownStates[index];

  }

  isDropdownOpen(index: number): boolean {
    return this.dropdownStates[index] || false;
  }

  calculateTotal(el: any): number {
    const ibs = +el.ibs || 0; // Converte para número ou usa 0 se for undefined/null
    const cbs = +el.cbs || 0;
    const is = +el.is || 0;
    const value = +el.value || 0;

    return (1 - (ibs + cbs + is)) * value;
  }
}



