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
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import * as DadosReforma from './../../../../public/file/forma.json'
import { HomeService } from './home.service';
import { DataReport, ResponseReport } from './home';
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
    FormsModule,
    ReactiveFormsModule
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
  private homeService = inject(HomeService);
  private fb = inject(FormBuilder);
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
  dataForma: any[] =[];
  dataReportReponse: ResponseReport = {} as ResponseReport;
  dataReport: any = {};
  fileName = '';
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

  aliquotaForm!: FormGroup;
  CBS = 0;
  IBS = 0;
  IS = 0;

  ngAfterViewInit() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {3

    }
  }

  ngOnInit(): void {
    this.aliquotaForm = this.fb.group({
      ALIQUOTA: [0],
      IBS: [0],
      CBS: [0],
      IS: [0]
    });
    this.aliquotaForm.get('IBS')?.valueChanges.subscribe((ibsValue) => {
      console.log("ibsValue: ", ibsValue)

      this.IBS = ((this.aliquotaForm.get('ALIQUOTA')?.value / 100) * (ibsValue/100))
    })

    this.aliquotaForm.get('CBS')?.valueChanges.subscribe((cbsValue) => {
      console.log("cbsValue: ", cbsValue)

      this.CBS = ((this.aliquotaForm.get('ALIQUOTA')?.value / 100) * (cbsValue/100))
      console.log("this.CBS: ", this.CBS)
    })

    this.aliquotaForm.get('IS')?.valueChanges.subscribe((isValue) => {
      console.log("cbsValue: ", isValue)

      this.IS = ((this.aliquotaForm.get('ALIQUOTA')?.value / 100) * (isValue/100))
      console.log("this.CBS: ", this.IS)
    })

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

      // this.dataChart.labels[0] = this.data[0].description;
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
    // this.dataSource = this.data.filter((el) => {
    //   return el.tipi.includes(item.tipi);
    // });
    this.renderer2.setProperty( this.inputRefTipi.nativeElement,'value', item.tipi)
  }

  selectClassification(item: string){
    if(this.inputRefDescription.nativeElement.value.length > 0 || this.inputRefTipi.nativeElement.value.length > 0){
      this.renderer2.setProperty( this.inputRefTipi.nativeElement,'value', '')
      this.renderer2.setProperty( this.inputRefDescription.nativeElement,'value', '')
    }
    this.dataSource = [];
    // this.dataSource = this.data.filter((el) => {
    //   return el.classification.includes(item);
    // });
    this.renderer2.setProperty( this.inputRefClassification.nativeElement,'value', item)
  }

  selectDescription(item: ProductTaxInfo){
    this.dataSource = [];
    // this.dataSource = this.data.filter((el) => {
    //   return el.description.includes(item.description);
    // });
    this.renderer2.setProperty( this.inputRefDescription.nativeElement,'value', item.description)
  }

  getClassifications(){
    // this.data.forEach((el) => {
    //   let alreadyHasClassification = false;
    //   this.listClassifications.forEach((elList) => {
    //     alreadyHasClassification = el.classification === elList;
    //   });

    //   if(!alreadyHasClassification){
    //     this.listClassifications.push(el.classification);
    //   }
    // })
  }

  clearFilters(){
    // this.dataSource = this.data;
    // this.listTipi = this.data;
    this.listClassifications = [];
    this.listDescriptions = [];
    this.getClassifications();
    this.renderer2.setProperty( this.inputRefClassification.nativeElement,'value', '')
    this.renderer2.setProperty( this.inputRefTipi.nativeElement,'value', '')
    this.renderer2.setProperty( this.inputRefDescription.nativeElement,'value', '')
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
      this.getData(el, 1, 10);
    }

    else{
      this.renderer2.setStyle( this.arrowDropdown.nativeElement,'transform', 'rotate(0deg)')
    }

    this.dropdownStates[index] = !this.dropdownStates[index];

    console.log("Detalhes: ", this.dataReport)

  }

  isDropdownOpen(index: number, classification: string): boolean {
    return this.dropdownStates[index] || false;
  }

  calculateTotal(el: any): number {
    const baseCalculo = el.VALUE * (1 - el)
    return baseCalculo;
   }

  uploadFileRules(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.homeService.uploadFileRules(file).subscribe(response => {
        console.log('File uploaded successfully', response);
      });
    }
  }

  uploadFileReport(event: any) {
    if(this.dataReportReponse && this.dataReport){
      this.dataReport = {};
      this.dataReportReponse = {} as ResponseReport;
      this.dropdownStates = {};
    }
    const file: File = event.target.files[0];
    console.log("File: ", file)
    this.fileName = file.name;
    if (file) {
      this.homeService.uploadFileReport(file).subscribe(response => {
        this.dataReportReponse = response;
        let object: DataReport = {} as DataReport;
        this.dataReportReponse.classifications.forEach((el) => {
          this.dataReport[el] = object;
        })
        // console.log('****************dataReport', this.dataReport);

        // this.readFile(file);
      });
    }
  }

  getData(classification: string, currentPage: number, size: number){
    this.homeService.getData(this.dataReportReponse._id, classification, currentPage, size).subscribe((data) => {
      this.dataReport[classification]=data;
      this.dataReport[classification].ncms.forEach((item: Record<string, any>) => {
        Object.keys(item).forEach((key) => {
          // console.log("Fora do IF:", key, item[key]);

          if (['CBS', 'CONFINS', 'IBS', 'IPI', 'IS', 'ISS', 'PIS', 'VALUE'].includes(key)) {
            const res = this.convertPercentage(item[key]);
            // console.log("Verificando o retorno:", res);

            // Atualiza diretamente o valor no objeto
            if(key === 'VALUE'){
              item[key] = Number(res);
            }
            else{
              item[key] = Number(res) / 100;
            }

          }
        });


        Object.keys(item['reductions']).forEach((key) => {
          // console.log("Fora do IF:", key, item[key]);

          const res = this.convertPercentage(item['reductions'][key]);

            item['reductions'][key] = Number(res) / 100;
        });
      });
    })
  }

  parseCSV(csvText: string): any[] {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');

    return lines.slice(1).filter(line => line.trim() !== '').map(line => {
      const values = line.split(',');
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header.trim()] = values[index]?.trim();
      });
      return obj;
    });
  }

  convertPercentage(value: string | number): number | string {
    if (typeof value === 'string' && value.endsWith('%')) {
      const numericValue = parseFloat(value.replace('%', '').replace(',', '.'));
      return isNaN(numericValue) ? value : numericValue;
    }
    return value;
  }

  calcTax(tax: number, value: number, reduction: number){
    const calcBase = (value * (1 - reduction ))

    console.log("************Resultado: ", calcBase * tax)

    return parseFloat((calcBase * tax).toFixed(2));
  }

  // Muda de página
  changePage(classification: string, currentPage: number, totalPages: number) {
    this.getData(classification, currentPage, totalPages);
    // if (newPage >= 1 && newPage <= this.totalPages) {
    //   this.currentPage = newPage;
    // }
  }
}



