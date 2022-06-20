import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Field, FieldType, Section } from '../../sharedTypes/sectionType';
import { FormArray, FormControl, Validators, ReactiveFormsModule, ValidatorFn, FormGroup, FormBuilder } from '@angular/forms';
import { dateMaxValidator } from '../../directives/validators/date-max-validator.directive';
import { dateMinValidator } from '../../directives/validators/date-min-validator.directive';
import { stringCheckValidator } from '../../directives/validators/string-check-validator.directive';
import { stringMaxLengthValidator } from '../../directives/validators/string-max-length-validator.directive';
import { stringMinLengthValidator } from '../../directives/validators/string-min-length-validator.directive';

@Component({
  selector: 'app-auto-generated-form-section',
  templateUrl: './auto-generated-form-section.component.html',
  styleUrls: ['./auto-generated-form-section.component.scss']
})
export class AutoGeneratedFormSectionComponent {

  public console = console;
  public formArray = new FormArray<FormControl>([]);
  /**
   * Variabile che determina se un accordion è aperto o chiuso
   * Se true l'accordion è aperto e i vari campi visibili - altrimenti è chiuso
   */
  public show = false;

  @Input() section?: Section;

  ngOnInit() {
    if (this.section) {
      //sort dei field della sezione in modo che siano nell'ordine corretto
      this.section = this.fieldsSorter(this.section);
      this.section = this.assegnazioneOrder(this.section);
      for (let field of this.section.fields) {
        this.formArray.push(new FormControl(this.getFieldValue(field), this.getValidators(field)));
      }
      // this.console.log(this.section.fields)
    }
  }

  /**
   * Transforms the incoming raw fieldType into a valid input type
   * @param {FieldType} stringa - String to "translate" so it becomes compatible with default HTML input types
   */
  public fieldTypeTranslator(stringa: FieldType): string {
    switch (stringa) {
      case "TEXT":
        return "text";
        break;
      case "TEXT_AREA":
        return "textarea"
        break;
      case "NUMERIC":
        return "number";
        break;
      case "DATE":
        return "date";
        break;
      case "RADIO":
        return "radio";
        break;
      case "SELECT":
        return "select";
        break;
      case "CHECKBOX":
        return "checkbox";
        break;
      default:
        throw new Error("INVALID_INPUT_TYPE");
        break;
    }
  }


  /**
   * 
   * Sorting dei fields di una sezione
   * @param {Section} section - sezione di cui fare il sorting dei fields
   * @returns {Fields[]}
   */
  public fieldsSorter(section: Section): Section {
    section.fields.sort(function (a, b) { return a.order - b.order; });
    return section;
  }

  /**
   * 
   * Vengono riassegnati gli order dei fields, in modo che siano numeri consecutivi,
   * al fine di evitare un problema di rendering che altrimenti si potrebbe verificare
   * @param {Section} section
   * @returns {Section} section
   */
  public assegnazioneOrder(section: Section): Section {
    for (let j = 0; j < section.fields.length; j++) {
      section.fields[j].order = j;
    }
    return section;
  }


  /**
   * Restituisce il valore del field
   * @param {Field} field - Field di cui si cerca il value
   */
  public getFieldValue(field: Field): string | string[] {
    return field.value;
  }

  /**
   * Dato un determinato campo, restituisce un array di validators per quel campo
   * @param {Field} field - Field 
   * @return {ValidatorFn[]}
   */
  public getValidators(field: Field): ValidatorFn[] {
    let validatorsArray = [];
    switch (field.fieldType) {
      case "TEXT":
        if (field.textVal && field.mandatory) {
          /**
           * controllo che esistano sia minLength che maxLength, in tal caso controllo anche che
           * minLength sia minore di maxLength, se vero aggiungo i validatori, se falso non li aggiungo
           */
          if ((field.textVal.minLength || field.textVal.minLength === 0) && (field.textVal.maxLength)) {
            if (field.textVal.minLength < field.textVal.maxLength) {
              validatorsArray.push(stringMaxLengthValidator(field.textVal.maxLength));
              validatorsArray.push(stringMinLengthValidator(field.textVal.minLength));
            } else {
              this.console.error("INVALID_DATA: " + field.fieldName);
            }
          } else {
            /**
             * se sono qui vuol dire che almeno uno dei due valori passati non esiste, controllo se uno dei valori
             * esiste e in tal caso aggiungo il corrispettivo validatore
             */
            if (field.textVal.maxLength || field.textVal.maxLength == 0) {
              validatorsArray.push(stringMaxLengthValidator(field.textVal.maxLength));
            }
            if (field.textVal.minLength || field.textVal.minLength == 0) {
              validatorsArray.push(stringMinLengthValidator(field.textVal.minLength));
            }
          }

          //TODO: regex da riguardare 
          if (field.textVal.isName) {
            //checks if the field.value is a name, then is valid
            validatorsArray.push(stringCheckValidator(/^[a-z ,.'-]+$/i));
          } else if (field.textVal.isEmail) {
            /**
             * RegEx per mail
             */
            validatorsArray.push(stringCheckValidator(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/));
          }
        }
        break;
      case "TEXT_AREA":
        //TODO
        break;
      case "NUMERIC":
        if (field.numVal && field.mandatory) {
          /**
           * controllo che esistano sia minVal che maxVal e che siano valori validi, dopodichè controllo 
           * che minVal sia minore di maxVal e in tal caso aggiungo i validators, altrimenti non li aggiungo
           */
          if ((field.numVal.minVal == 0 || field.numVal.minVal && (!(isNaN(field.numVal.minVal)))) && (field.numVal.maxVal == 0 || field.numVal.maxVal && (!isNaN(field.numVal.maxVal)))) {
            if (field.numVal.minVal < field.numVal.maxVal) {
              validatorsArray.push(Validators.min(field.numVal.minVal));
              validatorsArray.push(Validators.max(field.numVal.maxVal));
            } else {
              this.console.error("INVALID_DATA: " + field.fieldName);
            }
          } else {
            //controllo che il valore in questione sia un numero (accetta anche lo 0 e non ha problemi con falsy)
            if (field.numVal.minVal == 0 || field.numVal.minVal && (!(isNaN(field.numVal.minVal)))) {
              validatorsArray.push(Validators.min(field.numVal.minVal));
            }
            //controllo che il valore in questione sia un numero (accetta anche lo 0 e non ha problemi con falsy)
            if (field.numVal.maxVal == 0 || field.numVal.maxVal && (!isNaN(field.numVal.maxVal))) {
              validatorsArray.push(Validators.max(field.numVal.maxVal));
            }
          }
        }
        break;
      case "DATE":
        if (field.dateVal && field.mandatory) {
          /**
           * controllo se esistono sia maxDate che minDate e in tal caso verifico che maxDate sia maggiore, se è così
           * aggiungo i corrispettivi validators 
           */
          if (field.dateVal.maxDate && field.dateVal.minDate) {
            const minDateAsDate = new Date(field.dateVal.minDate);
            const maxDateAsDate = new Date(field.dateVal.maxDate);
            // controllo che la maxDate sia più grande della minDate se la condizione non viene rispettata
            // i validatori non verranno aggiunti
            if (maxDateAsDate > minDateAsDate) {
              validatorsArray.push(dateMinValidator(field.dateVal.minDate));
              validatorsArray.push(dateMaxValidator(field.dateVal.maxDate));
            } else {
              this.console.error("INVALID_DATA: " + field.fieldName);
            }
          } else {
            if (field.dateVal.minDate) {
              validatorsArray.push(dateMinValidator(field.dateVal.minDate));
            }
            if (field.dateVal.maxDate) {
              validatorsArray.push(dateMaxValidator(field.dateVal.maxDate));
            }
          }
        }
        break;
      case "RADIO":
        break;
      case "SELECT":
        break;
      case "CHECKBOX":
        break;
      default:
        throw new Error("INVALID_INPUT_TYPE");
    }

    /**
     * controllo se è obbligatoria la compilazione del campo e in tal caso ci aggiungo il required validator
     */
    if (field.mandatory) {
      validatorsArray.push(Validators.required);
    }
    return validatorsArray;
  }

  /**
   * assings to the formArray the initial values
   *  
   * @param {Section} section - sezione dei field a cui assegnare i valori iniziali 
   */
  public resetInitialValues(section: Section) {
    for (let field of section.fields) {
      this.formArray.at(field.order).setValue(field.value);
    }
  }

  /**
   * Mostra a console i valori dei campi della sezione data
   * @param {Section} section - Sezione di cui mostrare i valori
   */
  public showValues(section: Section) {
    for (let field of section.fields) {
      this.console.log(field.fieldName + ": " + this.formArray.at(field.order).value);
    }
  }

  /** 
   * imposta il valore del radio button cliccato al formArray nella posizione del field
  */
  public radioChange(fieldOrder: number, element: string) {
    // this.console.log(fieldOrder, element);∂
    this.formArray.at(fieldOrder).setValue(element)
  }

  /**
   * Modifica il formArray nella posizione del field modificato assegnando come valore l'array contenente i value delle 
   * checkbox in stato <checked>
   * @param {string} element - Valore della checkbox cliccata 
   * @param {string[]} values - Array contenente i valori delle checkbox in stato <checked> 
   * @param {number} order - Order del field
   */
  public checkBoxChange(element: string, values: string[], order: number) {
    /**
     * formArray.reset() assegna null a tutti gli elementi e non si può usare .includes() su null 
     */
    if (values == null) {
      values = []
    }
    values.includes(element) ? values = values.filter((oggetto): boolean => { return oggetto !== element }) : values.push(element);
    this.formArray.at(order).setValue(values);
  }

  /**
   * Al click della section name inverte lo stato di show
   */
  public showAccordion() {
    this.show = !this.show;
  }
}