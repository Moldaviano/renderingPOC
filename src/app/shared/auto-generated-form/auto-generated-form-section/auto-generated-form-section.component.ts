import { Component, Input } from '@angular/core';
import {
  comparator,
  condition,
  Field,
  FieldType,
  Section,
} from '../../sharedTypes/sectionType';
import {
  FormArray,
  FormControl,
  Validators,
  ValidatorFn,
} from '@angular/forms';
import { dateMaxValidator } from '../../directives/validators/date-max-validator.directive';
import { dateMinValidator } from '../../directives/validators/date-min-validator.directive';
import { stringCheckValidator } from '../../directives/validators/string-check-validator.directive';
import { stringMaxLengthValidator } from '../../directives/validators/string-max-length-validator.directive';
import { stringMinLengthValidator } from '../../directives/validators/string-min-length-validator.directive';
import { from, merge } from 'rxjs';

@Component({
  selector: 'app-auto-generated-form-section',
  templateUrl: './auto-generated-form-section.component.html',
  styleUrls: ['./auto-generated-form-section.component.scss'],
})
export class AutoGeneratedFormSectionComponent {
  public console = console;
  /**
   * contiene i form control
   */
  public formArray = new FormArray<FormControl>([]);
  /**
   * Variabile che determina se un accordion è aperto o chiuso.
   * Se true l'accordion è aperto e i vari campi visibili, altrimenti è chiuso
   */
  public show = false;
  /**
   * Indica se la password è visibile o nascosta
   */
  public showPass: boolean = false;
  /**
   * Determina se un campo è una password (utilizzato per mostrare/nascondere la password)
   */
  public isPass: boolean = false;

  @Input() section?: Section;

  ngOnInit(): void {
    if (this.section) {
      //sort dei field della sezione in modo che siano nell'ordine corretto
      this.section = this.fieldsSorter(this.section);
      this.section = this.assegnazioneOrder(this.section);
      for (let field of this.section.fields) {
        //creo FormControl per ogni campo della sezione
        const fc = new FormControl(
          this.getFieldValue(field),
          this.getValidators(field)
        );
        this.formArray.push(fc);
      }

      for (let field of this.section.fields) {
        //se un campo dipende da altri campi
        if (field.depends?.isDependent) {
          //trovo i campi dai quali dipende e li inserisco in un array
          let dependsOn: Field[] = [];
          for (let campo of this.section.fields) {
            if (
              field.depends?.isDependent &&
              field.depends.dependsFrom?.includes(campo.fieldName)
            ) {
              dependsOn.push(campo);
            }
          }

          for (let campo of dependsOn) {
            let thisField$ = from([field]);
            let questoField$ = this.formArray.at(campo.order).valueChanges;

            merge(thisField$, questoField$).subscribe((func): void => {
              let isValid: boolean = true;

              isValid = this.formArray.at(campo.order).invalid
                ? false
                : isValid;
              //controllo se i campi dai quali dipende sono validi
              for (let j = 0; j < dependsOn.length && isValid; j++) {
                isValid = this.formArray.at(dependsOn[j].order).valid;
              }

              /**
               * abilita o disabilita il campo in base alla validità dei campi dai quali dipende
               * tutti i campi dai quali dipende devono essere validi affinchè il field venga abilitato
               */
              if (isValid) {
                this.formArray.at(field.order).enable({ onlySelf: true });
              } else {
                this.formArray.at(field.order).disable({ onlySelf: true });
              }
            });
          }
        }
        // this.console.log(this.section.fields)
      }
    }
  }

  /**
   * Transforms the incoming raw fieldType into a valid input type
   * @param {FieldType} stringa - String to "translate" so it becomes compatible with default HTML input types
   */
  public fieldTypeTranslator(stringa: FieldType): string {
    switch (stringa) {
      case 'TEXT':
        return 'text';
        break;
      case 'TEXT_AREA':
        return 'textarea';
        break;
      case 'NUMERIC':
        return 'number';
        break;
      case 'DATE':
        return 'date';
        break;
      case 'RADIO':
        return 'radio';
        break;
      case 'SELECT':
        return 'select';
        break;
      case 'MULTI_SELECT':
        return 'multi_select';
        break;
      case 'CHECKBOX':
        return 'checkbox';
        break;
      case 'PASSWORD':
        return 'password';
      default:
        throw new Error('INVALID_INPUT_TYPE');
        break;
    }
  }

  /**
   *
   * Sorting dei fields di una sezione
   * @param {Section} section - sezione di cui fare il sorting dei fields
   * @returns {Fields[]}
   */
  private fieldsSorter(section: Section): Section {
    section.fields.sort(function (a, b): number {
      return a.order - b.order;
    });
    return section;
  }

  /**
   *
   * Vengono riassegnati gli order dei fields in modo che siano numeri consecutivi
   * al fine di evitare un problema di rendering che altrimenti si potrebbe verificare
   * @param {Section} section
   * @returns {Section} section
   */
  private assegnazioneOrder(section: Section): Section {
    for (let j = 0; j < section.fields.length; j++) {
      section.fields[j].order = j;
    }
    return section;
  }

  /**
   * Restituisce il value del field
   * @param {Field} field - Field di cui si cerca il value
   */
  private getFieldValue(field: Field): string | string[] {
    return field.value;
  }

  /**
   * Restituisce un array di validatori per field
   * @param {Field} field - Field
   * @return {ValidatorFn[]}
   */
  private getValidators(field: Field): ValidatorFn[] {
    let validatorsArray: ValidatorFn[] = [];
    switch (field.fieldType) {
      case 'TEXT':
        this.textValidators(field, validatorsArray);
        break;
      case 'TEXT_AREA':
        this.textValidators(field, validatorsArray);
        break;
      case 'PASSWORD':
        this.textValidators(field, validatorsArray);
        break;
      case 'NUMERIC':
        if (field.numVal && field.mandatory) {
          /**
           * controllo che esistano sia minVal che maxVal e che siano valori validi, dopodichè controllo
           * che minVal sia minore di maxVal e in tal caso aggiungo i validators, altrimenti non li aggiungo
           */
          if (
            (field.numVal.minVal == 0 ||
              (field.numVal.minVal && !isNaN(field.numVal.minVal))) &&
            (field.numVal.maxVal == 0 ||
              (field.numVal.maxVal && !isNaN(field.numVal.maxVal)))
          ) {
            if (field.numVal.minVal < field.numVal.maxVal) {
              validatorsArray.push(Validators.min(field.numVal.minVal));
              validatorsArray.push(Validators.max(field.numVal.maxVal));
            } else {
              this.console.error('INVALID_DATA: ' + field.fieldName);
            }
          } else {
            //controllo che il valore in questione sia un numero (accetta anche lo 0 e non ha problemi con falsy)
            if (
              field.numVal.minVal == 0 ||
              (field.numVal.minVal && !isNaN(field.numVal.minVal))
            ) {
              validatorsArray.push(Validators.min(field.numVal.minVal));
            }
            //controllo che il valore in questione sia un numero (accetta anche lo 0 e non ha problemi con falsy)
            if (
              field.numVal.maxVal == 0 ||
              (field.numVal.maxVal && !isNaN(field.numVal.maxVal))
            ) {
              validatorsArray.push(Validators.max(field.numVal.maxVal));
            }
          }
        }
        break;
      case 'DATE':
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
              this.console.error('INVALID_DATA: ' + field.fieldName);
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
      case 'RADIO':
        break;
      case 'SELECT':
        break;
      case 'MULTI_SELECT':
        break;
      case 'CHECKBOX':
        break;
      default:
        throw new Error('INVALID_INPUT_TYPE');
    }

    /**
     * controllo se è obbligatoria la compilazione del campo e in tal caso ci aggiungo il required validator
     * aggiungere "&& field.fieldType != 'CHECKBOX'" per rendere le checkbox opzionali
     */
    if (field.mandatory) {
      validatorsArray.push(Validators.required);
    }
    return validatorsArray;
  }

  /**
   * restituisce un array con i validatori per campi di tipo TEXT, TEXT_AREA e PASSWORD
   * @param {Field} field - campo al quale associare il/i validatore/i
   * @param {ValidatorFn[]} validatorsArray - Array di validator per quel campo
   * @returns
   */
  private textValidators(
    field: Field,
    validatorsArray: ValidatorFn[]
  ): ValidatorFn[] {
    if (field.textVal && field.mandatory) {
      /**
       * controllo che esistano sia minLength che maxLength, in tal caso controllo anche che
       * minLength sia minore di maxLength, se vero aggiungo i validatori, se falso non li aggiungo
       */
      if (
        (field.textVal.minLength || field.textVal.minLength === 0) &&
        field.textVal.maxLength
      ) {
        if (field.textVal.minLength < field.textVal.maxLength) {
          validatorsArray.push(
            stringMaxLengthValidator(field.textVal.maxLength)
          );
          validatorsArray.push(
            stringMinLengthValidator(field.textVal.minLength)
          );
        } else {
          this.console.error('INVALID_DATA: ' + field.fieldName);
        }
      } else {
        /**
         * se sono qui vuol dire che almeno uno dei due valori passati non esiste, controllo se uno dei valori
         * esiste e in tal caso aggiungo il corrispettivo validatore
         */
        if (field.textVal.maxLength || field.textVal.maxLength == 0) {
          validatorsArray.push(
            stringMaxLengthValidator(field.textVal.maxLength)
          );
        }
        if (field.textVal.minLength || field.textVal.minLength == 0) {
          validatorsArray.push(
            stringMinLengthValidator(field.textVal.minLength)
          );
        }
      }
      //TODO: regex da riguardare
      //per aggiungere validatori che sfruttano le regex basta pushare stringCheckValidator(<regex>) dentro a validatorsArray
      if (field.textVal.isName) {
        validatorsArray.push(stringCheckValidator(/^[a-z ,.'-]+$/i));
      } else if (field.textVal.isEmail) {
        validatorsArray.push(
          //regex per mail
          stringCheckValidator(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
        );
      }
    }
    return validatorsArray;
  }

  /**
   * riassegna i valori iniziali ai campi del FormArray
   * @param {Section} section - sezione dei field a cui assegnare i valori iniziali
   */
  public resetInitialValues(section: Section): void {
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
      this.console.log(
        field.fieldName + ': ' + this.formArray.at(field.order).value
      );
    }
  }

  /**
   * imposta il valore del radio button cliccato al formArray nella posizione del field
   */
  public radioChange(fieldOrder: number, element: string): void {
    // this.console.log(fieldOrder, element);∂
    this.formArray.at(fieldOrder).setValue(element);
  }

  /**
   * Modifica il formArray nella posizione del field modificato assegnando come valore l'array contenente i value delle
   * checkbox in stato <checked>
   * @param {string} element - Valore della checkbox cliccata
   * @param {string[]} values - Array contenente i valori delle checkbox in stato <checked>
   * @param {number} order - Order del field
   */
  public checkBoxChange(
    element: string,
    values: string[],
    order: number
  ): void {
    /**
     * formArray.reset() assegna null a tutti gli elementi e non si può usare .includes() su null
     */
    if (values == null || typeof values === 'string') {
      values = [];
    }
    values.includes(element)
      ? (values = values.filter((oggetto): boolean => {
          return oggetto !== element;
        }))
      : values.push(element);
    this.formArray.at(order).setValue(values);
  }

  /**
   * Al click della section name inverte lo stato di show
   */
  public showAccordion(): void {
    this.show = !this.show;
    this.console.log(this.formArray);
  }

  /**
   * modifica il tipo del field in modo che la password venga resa visibile o nascosta
   * @param {Field} field - di tipo password al quale modificare la visibilità del contenuto
   */
  public showPassword(field: Field): void {
    this.showPass = !this.showPass;
    this.isPass = true;
    if (field.textVal) {
      field.textVal.isPass = true;
    }
    field.fieldType = this.showPass ? 'TEXT' : 'PASSWORD';
  }

  /**
   *  Restituisce il risultato delle condizioni in entrata e restituisce un booleano.
   * TRUE se le condizioni vengono rispettate | FALSE se le condizioni non sono rispettate
   *
   * //TODO
   *
   * @param { condition } condizione - Optional: contiene le condizioni che devono essere rispettate affinchè il campo sia visualizzato/abilitato/valido
   * @returns { boolean }
   */
  public getConditionResult(condizione?: condition): boolean {
    if (condizione == undefined) {
      return true;
    } else {
      if (
        condizione.primaCondizione &&
        condizione.operatoreLogico &&
        condizione.secondaCondizione
      ) {
        //primo gruppo di condizioni da concatenare
        let primoValoreOne = condizione.primaCondizione.firstComparedFactor;
        let comparatoreOne = condizione.primaCondizione.comparator;
        let secondoValoreOne = condizione.primaCondizione.secondComparedFactor;
        //secondo gruppo di condizioni da concatenare
        let primoValoreTwo = condizione.secondaCondizione.firstComparedFactor;
        let comparatoreTwo = condizione.secondaCondizione.comparator;
        let secondoValoreTwo =
          condizione.secondaCondizione.secondComparedFactor;
        //operatore logico per concatenare più condizioni
        let operatoreLogico = condizione.secondaCondizione.comparator;
        /**
         * In base a quale sia l'operatore logico restituisco il risultato dell'operazione (logica)
         */
        return condizione.operatoreLogico == '&&'
          ? this.compare(primoValoreOne, comparatoreOne, secondoValoreOne) &&
              this.compare(primoValoreTwo, comparatoreTwo, secondoValoreTwo)
          : this.compare(primoValoreOne, comparatoreOne, secondoValoreOne) ||
              this.compare(primoValoreTwo, comparatoreTwo, secondoValoreTwo);
      }

      let primoValore = condizione.firstComparedFactor;
      let secondoValore = condizione.secondComparedFactor;
      let comparatore = condizione.comparator;
      return condizione.comparedFactorsAreFieldNames
        ? true
        : this.compare(primoValore, comparatore, secondoValore);
    }
  }

  /**
   * Prendendo in ingresso due valori e un operatore di comparazione, restituisce il risultato
   * dell'operazione logica.
   * Se l'operatore logico è 'isIncludedIn' e il secondo parametro non è un array
   * verrà restituito false
   * //READ TESTATO e funzionante
   * //TODO: implementare comparazioni più specifiche (es. date)
   *
   *
   * @param {string | number} primoValore - Primo dei due valori da comparare
   * @param {comparator} comparatore - Operatore di comparazione da adottare
   * @param {string | string[] | number | number[]} secondoValore
   * @returns {boolean} risultato della comparazione
   */
  private compare(
    primoValore: string | number,
    comparatore: comparator,
    secondoValore: number | number[] | string | string[]
  ): boolean {
    switch (comparatore) {
      case 'isIncludedIn':
        if (Array.isArray(secondoValore)) {
          return secondoValore.includes(primoValore as never);
        } else {
          this.console.error('UNEXPECTED_VALUE');
          return false;
        }
        break;
      case '==':
        return primoValore == secondoValore;
        break;
      case '===':
        return primoValore === secondoValore;
        break;
      case '!=':
        return primoValore != secondoValore;
        break;
      case '<':
        return primoValore < secondoValore;
        break;
      case '<=':
        return primoValore <= secondoValore;
        break;
      case '>':
        return primoValore > secondoValore;
        break;
      case '>=':
        return primoValore >= secondoValore;
        break;
      default:
        this.console.error('Qualcosa è andato storto...');
        return false;
        break;
    }
  }

  /**
   * Ricevute due stringhe in ingresso, controlla se indicano il nome di un altro campo e in tal caso viene fatto il contronto
   * utilizzando il/i valore/i di quel/i campo/i.
   * Se la stringa non corrisponde con il nome di un altro campo allora viene interpetato come valore sul quale effettuare un
   * controllo e passato a compare()
   *
   * //READ: NON ANCORA TESTATO
   *
   * @param {string} nomePrimoField - Indica il nome di un campo dal quale ricevere il valore
   * @param {comparator} comparatore - Indica il tipo di comparazione che dev'essere fatta tra i due valori (vedi il tipo comparator)
   * @param {string} nomeSecondoField - Indica il nome di un campo dal quale ricevere il valore
   * @returns
   */
  private compareFieldValues(
    nomePrimoField: string,
    comparatore: comparator,
    nomeSecondoField: string
  ): boolean {
    let primoField: Field | void;
    let secondoField: Field | void;
    if (this.section) {
      for (let campo of this.section.fields) {
        /**
         * //FIXME: da notare che è valido solo per le condizioni di visibilità
         * da sistemare in modo che funzioni per tutte le condizioni
         */
        if (
          campo.depends?.fieldStatus?.conditionForVisibility
            ?.firstFactorIsFieldName &&
          nomePrimoField == campo.fieldName
        ) {
          primoField = campo;
        }
        if (
          campo.depends?.fieldStatus?.conditionForVisibility
            ?.secondFactorIsFieldName &&
          nomeSecondoField == campo.fieldName
        ) {
          secondoField = campo;
        }
      }
    }

    let primoValore;
    let secondoValore;
    /**
     * controllo se i due field sono stati assegnati, in tal caso a compare() viene passato il valore
     * del field, altrimenti il nome viene interpetato come dato da comparare.
     *
     * //TODO: implementare comparazioni più specifiche (es. date)
     */
    primoValore = primoField
      ? this.formArray.at(primoField.order).value
      : nomePrimoField;
    secondoValore = secondoField
      ? this.formArray.at(secondoField.order).value
      : nomeSecondoField;

    /**
     * controllo che i tipi corrispondano al fine di eseguire una comparazione sensata
     */
    if (typeof primoValore == typeof secondoValore) {
      return this.compare(primoValore, comparatore, secondoValore);
    } else {
      this.console.error('INCOMPATIBLE_FIELDTYPES');
      return false;
    }
  }
}
