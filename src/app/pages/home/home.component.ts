import { Component, ElementRef, HostListener, inject, OnInit, Renderer2, ViewChild } from '@angular/core';
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
  columnsToDisplay: columnName[] = ['input','tipi','classification', 'description', 'ibs' , 'cbs' , 'is', 'value'];
  expandedElement: any | null;
  showBoxListTipi: boolean = false;
  @ViewChild('inputRefTipi') inputRefTipi!: ElementRef;
  @ViewChild('inputRefClassification') inputRefClassification!: ElementRef;
  @ViewChild('inputRefDescription') inputRefDescription!: ElementRef;
  @ViewChild('arrowDropdown') arrowDropdown!: ElementRef;
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

  ngAfterViewInit() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {3

    }
  }

  ngOnInit(): void {
    this.aliquotaForm = this.fb.group({
      ALIQUOTA: [27.5],
      IBS: [30],
      CBS: [40],
      IS: [30]
    });

    this.aliquotaForm.get('ALIQUOTA')?.valueChanges.subscribe((aliquotaValue) => {
      console.log("ibsValue: ", aliquotaValue)

      if(!aliquotaValue){
        this.IBS = 0;
        this.CBS = 0;
        this.IS = 0;
        this.aliquotaForm.patchValue({
          IBS: 0,
          CBS: 0,
          IS: 0
        });
      }

    })
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

  toggleDropdown(index: number, el: any): void {
    if(el !== 'total'){
      if(!this.dropdownStates[index] ){
        this.renderer2.setStyle( this.arrowDropdown.nativeElement,'transform', 'rotate(180deg)')
        this.getData(el, 1);
      }
      else{
        this.renderer2.setStyle( this.arrowDropdown.nativeElement,'transform', 'rotate(0deg)')
      }
      this.dropdownStates[index] = !this.dropdownStates[index];
    }
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
        console.log('****************dataReport', this.dataReport);

        // this.readFile(file);
      });
    }
  }

  getData(classification: string, currentPage: number){
    // if(!Object.hasOwn(this.dataReport[classification], 'currentOperation')){
    //   this.dataReport[classification]['currentOperation'] = null;
    // }
    this.homeService.getData(this.dataReportReponse._id, classification, currentPage, 10,  this.dataReport[classification]['currentOperation']).subscribe((data) => {
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
    return parseFloat((calcBase * tax).toFixed(2));
  }

  changePage(classification: string, currentPage: number) {
    this.getData(classification, currentPage);
  }

  onAliquotaChange(value: number): void {
    this.aliquotaForm.get('ALIQUOTA')?.setValue(value);
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
  toggleDropdownInput(index: number, el: any) {
    this.dropdownStatesInputFilter[index] = !this.dropdownStatesInputFilter[index];
  }

  isDropdownIputFilterOpen(index: number, classification: string): boolean {
    return this.dropdownStatesInputFilter[index] || false;
  }

  onSelectChange(value: string, classification: string, index: number) {
    // const value = (event.target as HTMLSelectElement).value;
    // console.log('Selecionado:', value);
    this.isDropdownInputOpen = false; // Fecha o dropdown após a seleção
    if(value !== 'null'){
      this.dataReport[classification]['currentOperation'] = value;
      this.getData(classification, 1)
    }
    else{
      this.dataReport[classification]['currentOperation'] = null;
      this.getData(classification, 1)
    }
    this.toggleDropdownInput(index, classification)
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    if (
      this.isDropdownInputOpen &&
      this.dropdownTrigger &&
      !this.dropdownTrigger.nativeElement.contains(event.target) &&
      this.dropdownMenu &&
      !this.dropdownMenu.nativeElement.contains(event.target)
    ) {
      this.isDropdownInputOpen = false;
    }
  }

}



