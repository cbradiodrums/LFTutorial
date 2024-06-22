// === Form Field Declarations ===
const _EditButton = {fieldId: 5}

// === Form Subscriptions ===
readOnlyForm()
LFForm.onFieldChange(readOnlyForm, _EditButton)

// === Dynamic Form Functions ===
function readOnlyForm () {  

    // Exclusion Fields
    let excludeFieldIds = [_EditButton['fieldId']]

    // Fetch all fields that aren't read Only
    let findFields = LFForm.findFields(
        f => ( f.settings.readOnly !== true && !excludeFieldIds.includes(f.settings.fieldId) && !['Page', 'Form'].includes(f.settings.componentType) )
    )
    console.log(findFields)

    let editPage = LFForm.getFieldValues(_EditButton)['value']
    switch (editPage) {
        case "YES": 
            LFForm.enableFields(findFields)
            break;
        case "NO":
        default:
            LFForm.disableFields(findFields)
            break;
    }
}