import { Component, Input } from '@angular/core';
import { DataFlowService } from 'src/app/services/data-flow.service';
// import { fakeFormData } from 'src/app/fileTest/test_renderingPOC';
import { Section } from '../sharedTypes/sectionType';

@Component({
  selector: 'app-auto-generated-form',
  templateUrl: './auto-generated-form.component.html',
  styleUrls: ['./auto-generated-form.component.scss'],
})
export class AutoGeneratedFormComponent {
  public console = console;

  //this section array is sorted in the initialization
  public sections: Section[] = this.dataFlow.getFakeData();

  constructor(private dataFlow: DataFlowService) {
    dataFlow.getFakeData();
    // this.sectionOrderReassingment(this.sections);
  }

  ngOnInit() {}

  /**
   *
   * prende l'array di sezioni e riassegna gli order, in modo che siano tutti numeri positivi e consecutivi,
   * al fine di evitare un problema di rendering che altrimenti potrebbe verificarsi.
   *
   * l'ordine delle sezioni rimane invariato
   *
   * @param {Section[]} sections
   */
  // public sectionOrderReassingment(sections: Section[]){
  //   for( let i = 0; i < sections.length; i++){
  //     sections[i].order = i;
  //   }
  // }
}
