/**
 * Contains all the possible infos about a section and section's fields
 * 
 * @param {LangCode} name - Section's name
 * @param {number} order - Section's order value | lower values will come before higher values in the list
 * @param {Field[]} fields - Array which contains inputs and infos about form's inputs
 */
export type Section = {
    /**
     * Section name --> can have translation to be shown to the user in his default language
     */
    name: LangCode;
    /**
     * Section order value - lower values will come before higher values in the list
     */
    order: number;
    /**
     * Array which contains inputs and infos about form's inputs
     */
    fields: Field[];
}

export type Field = {
    fieldName: string;
    /**
     * Field's name which will be shown to the user, can have multiple translation and can be shown to the user in his
     * default language
     */
    label: LangCode;
    /**
     * Field's input type can be =
     * {"TEXT" | "TEXT_AREA" | "NUMERIC" | "DATE" | "RADIO" | "SELECT" | "CHECKBOX"}
     */
    fieldType: FieldType;
    /**
     * Optional: properties for numbers useful for the validation
     */
    numVal?: numericProp;
    /**
     * Optional: properties for strings useful for the validation
     */
    textVal?: stringProp;
    /**
     * Optional: properties for dates useful for the validation
     */
    dateVal?: dateProp;
    /**
     * Optional: list of items to be shown in radio, select and checkbox input
     */
    selectableItems?: string[];
    /**
     * Defines if the field has to be filled or not to proceed
     */
    mandatory: boolean;
    /**
     * Field's order value | lower values will come before higher values in the list
     */
    order: number;
    /**
     * Field's start value
     */
    value: string | string[];
}

export type FieldType = "TEXT" | "TEXT_AREA" | "NUMERIC" | "DATE" | "RADIO" | "SELECT" | "CHECKBOX";

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
 * It is used when a string can have a translation which can be displayed if possible.
 * Each field of this type represents a possible translation in a specific language.
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
     * Optional: defines the lowest value that the number can assume
     */
    minVal?: number;
    /**
     * Optional: defines the higher value that the number can assume
     */
    maxVal?: number;
}

type stringProp = {
    /**
     * Optional: defines if the string must be a name (usable with surnames too)
     */
    isName?: boolean;
    /**
     * Optional: defines if the string must be an email
     */
    isEmail?: boolean;
    minLength?: number;
    maxLength?: number;
}

type dateProp = {
    /**
     * Optional: defines the lowest date acceptable
     */
    minDate?: string;
    /**
     * Optional: defines the highest date acceptable
     */
    maxDate?: string;
}