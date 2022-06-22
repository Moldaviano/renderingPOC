import { R3PipeDependencyMetadata } from "@angular/compiler";

/**
 * Contains all the possible infos about a section and section's fields
 * 
 * @param {LangCode} name - Section's name
 * @param {number} order - Section's order value | lower values will come before higher values in the list
 * @param {Field[]} fields - Array which contains inputs and infos about form's inputs
 */
export type Section = {
    /**
     * Nome della sezione, può contenere traduzioni in diverse lingue in modo 
     */
    name: LangCode;
    /**
     * Numero che indica l'ordine delle sezioni, numeri più bassi vengono generati prima (evitare presenza di sezioni con lo stesso order)
     */
    order: number;
    /**
     * Array contenente i vari field della sezione e le relative caratteristiche
     */
    fields: Field[];
}

export type Field = {
    fieldName: string;
    /**
     * Nome del field che verrà mostrato all'utente accanto al campo da compilare
     */
    label: LangCode;
    /**
     * Tipo di input del campo, può essere:
     * {"TEXT" | "TEXT_AREA" | "NUMERIC" | "DATE" | "RADIO" | "SELECT" | "CHECKBOX"}
     */
    fieldType: FieldType;
    /**
     * Optional: proprietà per gli input numerici, utile per la validazione
     */
    numVal?: numericProp;
    /**
     * Optional: proprietà per gli input di tipo TEXT, TEXT_AREA e PASSWORD, utile per la validazione
     */
    textVal?: stringProp;
    /**
     * Optional: proprietà per gli input di date, utile per la validazione
     */
    dateVal?: dateProp;
    /**
     * Optional: lista di elementi che possono essere selezionati, utilizzabile per SELECT, RADIO e CHECKBOX
     */
    selectableItems?: string[];
    /**
     * Determina se il campo dev'essere obbligatoriamente compilato per inviare il form, viene utilizzato dal validatore per definire se
     * è required o meno
     */
    mandatory: boolean;
    /**
     * Numero che indica l'ordine dei campi, numeri più bassi vengono generati prima (evitare presenza di sezioni con lo stesso order)
     */
    order: number;

    depends?: dependent;

    /**
     * Valore iniziale del campo
     */
    value: string | string[];
}

export type FieldType = "TEXT" | "TEXT_AREA" | "NUMERIC" | "DATE" | "RADIO" | "SELECT" | "CHECKBOX" | "PASSWORD";

// export const fieldType: FieldType[] = [
//     "TEXT",
//     "TEXT_AREA",
//     "NUMERIC",
//     "DATE",
//     "RADIO",
//     "SELECT",
//     "CHECKBOX"
// ];

/**
 * Viene utilizzato quando una stringa può avere delle traduzioni, ogni campo indica una lingua
 * in cui la stringa può essere tradotta
 */
type LangCode = {
    it?: string;
    en?: string;
}

/**
 * @param {number} minVal - 
 * @param {number} maxVal - 
 */
type numericProp = {
    /**
     * Optional: determina il valore minimo che il numero può assumere affinchè il campo risulti valido
     */
    minVal?: number;
    /**
     * Optional: determina il valore massimo che il numero può assumere affinchè il campo risulti valido
     */
    maxVal?: number;
}

type stringProp = {
    /**
     * //TODO: rivedere regex
     * Optional: determina se la stringa in questione è un nome (utilizzabile anche con cognomi)
     */
    isName?: boolean;
    /**
     * Optional: determina se la stringa in questione dev'essere una mail
     */
    isEmail?: boolean;
    /**
     * Optional: determina il numero minimo di valori che la stringa deve avere affinchè il campo risulti valido
     */
    minLength?: number;
    /**
     * Optional: determina il numero massimo di valori che la stringa può avere affinchè il campo risulti valido
     */
    maxLength?: number;
    isPass?: boolean;
}

type dateProp = {
    /**
     * Optional: determina la data più remota che si può inserire affinchè il campo risulti valido
     */
    minDate?: string;
    /**
     * Optional: 
     */
    maxDate?: string;
}

type dependent = {
    /**
     * Determina se questo campo dipende da altri campi
     */
    isDependent: boolean;
    /**
     * Nome del campo dal quale dipende
     */
    dependsFrom?: string[]
}