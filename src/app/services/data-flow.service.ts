import { Injectable } from '@angular/core';
import { Field, Section } from '../shared/sharedTypes/sectionType';

@Injectable({
  providedIn: 'root'
})
export class DataFlowService {

  private nMaxSections: number = 10;
  private nMaxFields: number = 30;

  /**
   * 
   * @returns {Section[]} Array di sezioni generate in maniera casuale
   */
  public getFakeData(): Section[] {
    let fakeData: Section[] = [];
    fakeData = this.getSections(fakeData);
    return fakeData;
  }

  private getSections(fakeData: Section[]){
    // let nSections = this.getNSections()
    for(let i = 0; i < this.nMaxSections; i++){
      fakeData[i] = {
        "name": {
          "en": `Section ${i}`,
          "it": `Sezione ${i}` 
        },
        "order": i,
        "fields": []
      }
      console.log(fakeData[i].name)
    }

    return fakeData;
  }
  
  /**
   * restituisce un numero casuale di sections che saranno inserite nella pagina
   * @returns {number}
   */
  private getNSections():number{
    return Math.round(Math.random() * this.nMaxSections);
  }

}
