import { Component, ElementRef, inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { HeaderComponent } from "../../shared/header/header.component";
import { animate, state, style, transition, trigger } from '@angular/animations';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTableModule} from '@angular/material/table';
import { ChartModule } from 'primeng/chart';
import { HeaderTablePipe } from '../../shared/pipes/header-table.pipe';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeService } from './home.service';
import { Report, ResponseReport } from './home';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt);
type columnName = 'input' |'tipi' |'classification' | 'description' | 'iss'| 'ibs' | 'cbs' | 'is'| 'value'| 'pis'| 'cofins'| 'ipi' | 'icms' | 'total_pós' | 'total_pré' ;

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
    FormsModule,
    ReactiveFormsModule,
    NgxMaskDirective,
  ],
  providers: [
    provideNgxMask(),
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
  columnsToDisplay: columnName[] = ['input','tipi','classification','description', 'ipi','iss','pis','cofins', 'total_pré', 'ibs' , 'cbs' , 'is', 'total_pós' ,'value'];
  expandedElement: any | null;
  showBoxListTipi: boolean = false;
  @ViewChild('inputRefTipi') inputRefTipi!: ElementRef;
  @ViewChild('inputRefClassification') inputRefClassification!: ElementRef;
  @ViewChild('inputRefDescription') inputRefDescription!: ElementRef;
  @ViewChild('arrowDropdown') arrowDropdown!: ElementRef;
  @ViewChild('arrowDropdownInput') arrowDropdownInput!: ElementRef;
  isDropdownInputOpen = false;

  @ViewChild('dropdownTrigger') dropdownTrigger!: ElementRef;
  @ViewChild('dropdownMenu') dropdownMenu!: ElementRef;

  currentTab = 'home';
  dataForma: any[] =[];
  dataReportReponse: ResponseReport = {} as ResponseReport;
  dataReport: any = {};
  fileName = '';

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

  ngOnInit(): void {
    this.aliquotaForm = this.fb.group({
      ALIQUOTA: [27.5],
      IBS: [70],
      CBS: [30],
      IS: [10]
    });
    const aliquota = this.aliquotaForm.get('ALIQUOTA')?.value;
    const ibs = this.aliquotaForm.get('IBS')?.value;
    const cbs = this.aliquotaForm.get('CBS')?.value;
    const is = this.aliquotaForm.get('IS')?.value;

    this.IBS = ((aliquota / 100) * (ibs/100));
    this.CBS = ((aliquota / 100) * (cbs/100))
    this.IS = (is/100)

    this.onAliquotaChange();
    this.changeTaxs();


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
  }

  toggleTab(tab: string){
    this.currentTab = tab;
  }

  dropdownStates: { [key: number]: boolean } = {};

  toggleDropdown(index: number, el: any, operation: string): void {
    if(el !== 'total'){
      if(!this.dropdownStates[index] ){
        this.getData(el, 1, operation);
      }
      this.dropdownStates[index] = !this.dropdownStates[index];
    }
  }


  isDropdownOpen(index: number): boolean {
    return this.dropdownStates[index] || false;
  }

  uploadFileRules(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.homeService.uploadFileRules(file).subscribe(response => {
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
    this.fileName = file.name;
    if (file) {
      const aliquota = this.aliquotaForm.get('ALIQUOTA')?.value;
      const ibs = this.aliquotaForm.get('IBS')?.value;
      const cbs = this.aliquotaForm.get('CBS')?.value;
      const is = this.aliquotaForm.get('IS')?.value;
      this.homeService.uploadFileReport(file, aliquota, ibs, cbs, is ).subscribe(response => {
        this.dataReportReponse = response;
        let object: Report = {} as Report;
        this.dataReportReponse.classifications.forEach((el) => {
          this.dataReport[el.name] = object;
        })

        this.dataReportReponse.classifications = this.dataReportReponse.classifications.sort((a, b) => {
          return a.name === "total" ? -1 : b.name === "total" ? 1 : 0;
        });
      });
    }
  }

  getData(classification: string, currentPage: number, currentOperation: string ){
    if(currentOperation){
      this.dataReport[classification]['currentOperation'] = currentOperation;
    }

    this.homeService.getData(this.dataReportReponse._id, classification, currentPage, 10,  currentOperation).subscribe((data) => {
      this.dataReport[classification]=data;
      this.dataReport[classification].ncms.forEach((item: Record<string, any>) => {
        Object.keys(item).forEach((key) => {

          if (['CBS', 'IBS', 'IS'].includes(key)) {
            const res = this.convertPercentage(item[key]);

            if(key === 'VALUE'){
              item[key].replace()
              item[key] = Number(res);
            }
            else{
              item[key] = Number(res) / 100;
            }
          }

          if (['IPI', 'ISS', 'PIS', 'CONFINS', 'VALUE'].includes(key)) {
            const numericValue = parseFloat(item[key].replace('%', '').replace(',', '.'));
            item[key] = Number(numericValue);
          }
        });

        Object.keys(item['reductions']).forEach((key) => {

          const res = this.convertPercentage(item['reductions'][key]);

            item['reductions'][key] = Number(res) / 100;
        });
      });

    })
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
    return parseFloat((calcBase * tax).toFixed(2));
  }
  calcTaxTotal(value: number, reduction_ibs: number, reduction_cbs: number, reduction_is: number,){
    const ibs = this.calcTax(this.IBS, value, reduction_ibs);
    const cbs = this.calcTax(this.CBS, value, reduction_cbs);
    const is = this.calcTax(this.IS, value, reduction_is);

    return ibs + cbs + is;
  }

  changePage(classification: string, currentPage: number, currentOperation: any) {
    this.getData(classification, currentPage, currentOperation);
  }

  onAliquotaChange(): void {
    this.aliquotaForm.get('ALIQUOTA')?.valueChanges.subscribe((aliquotaValue)=>{
      const ibs = this.aliquotaForm.get('IBS')?.value;
      const cbs = this.aliquotaForm.get('CBS')?.value;
      const is = this.aliquotaForm.get('IS')?.value;
      this.IBS = ((aliquotaValue / 100) * (ibs/100))
      this.CBS = ((aliquotaValue / 100) * (cbs/100))
      this.IS = (is/100)
    })
  }

  changeTaxs(){
    let aliquotaValue = this.aliquotaForm.get('ALIQUOTA')?.value
    this.aliquotaForm.get('IBS')?.valueChanges.subscribe((ibsValue) => {
      this.IBS = ((aliquotaValue / 100) * (ibsValue/100))

    })


    this.aliquotaForm.get('CBS')?.valueChanges.subscribe((cbsValue) => {
      this.CBS = ((aliquotaValue / 100) * (cbsValue/100))
    })

    this.aliquotaForm.get('IS')?.valueChanges.subscribe((isValue) => {
      this.IS = (isValue/100)
    })
  }

  updateTax(taxName: string){
    const newValue = 100 - this.aliquotaForm.get(taxName)?.value;
    const changeTaxName = taxName === 'IBS'? 'CBS': 'IBS';

    this.aliquotaForm.patchValue({
      [changeTaxName]: newValue
    })

  }

  onPercentInput(field: string, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (!inputElement) return;

    let value = inputElement.value;

    value = value.replace(/[^\d,]/g, ''); // Remove qualquer caractere que não seja número ou vírgula

    this.aliquotaForm.get(field)?.setValue(value, { emitEvent: false });

    const numericValue = parseFloat(value.replace(',', '.')); // Substitui ',' por '.' apenas internamente
    if (!isNaN(numericValue)) {
      this.aliquotaForm.get(field)?.setValue(numericValue, { emitEvent: false, onlySelf: true });
    }
  }

  sortByColumn(el:any){}

  dropdownStatesInputFilter: { [key: number]: boolean } = {};
  toggleDropdownInput(index: number, el: any, operation: string) {
    if(!this.dropdownStatesInputFilter[index] ){
      if(operation !== 'Todas'){
        this.getData(el, 1, operation);
      }
    }

    this.dropdownStatesInputFilter[index] = !this.dropdownStatesInputFilter[index];

  }

  isDropdownIputFilterOpen(index: number, classification: string): boolean {
    return this.dropdownStatesInputFilter[index] || false;
  }

  onSelectChange(value: string, classification: string, index: number) {
    this.isDropdownInputOpen = false; // Fecha o dropdown após a seleção
    if(value !== 'null'){
      this.dataReport[classification]['currentOperation'] = value;
      this.getData(classification, 1, value)
    }
    else{
      this.dataReport[classification]['currentOperation'] = null;
      this.getData(classification, 1, value)
    }
    this.toggleDropdownInput(index, classification, value)
  }

  updateAliquotas(){
    const aliquota = this.aliquotaForm.get('ALIQUOTA')?.value;
    const ibs = this.aliquotaForm.get('IBS')?.value;
    const cbs = this.aliquotaForm.get('CBS')?.value;
    const is = this.aliquotaForm.get('IS')?.value;
    this.homeService.updateAliquotas(this.dataReportReponse._id, aliquota, ibs, cbs, is).subscribe((response) =>{
      this.dataReportReponse = {} as ResponseReport;
      this.dataReportReponse = response;
      let object: Report = {} as Report;
      this.dataReportReponse.classifications.forEach((el) => {
        this.dataReport[el.name] = object;
      })
      this.dataReportReponse.classifications = this.dataReportReponse.classifications.sort((a, b) => {
        return a.name === "total" ? -1 : b.name === "total" ? 1 : 0;
      });
      Object.keys(this.dropdownStates).forEach((el, index) => {
        this.dropdownStates[index] = false;
      })
    })
  }

}



