// Environment Variables
const testLogging = false // show console messages
const testData = false // preload the form with testData
const productionView = true // access / view of all form fields

// === Form Field Declarations
// Approval Collection
const _approvalCOL = {fieldId: 1}
const _employeeName = {fieldId: 4}
const _clearanceDD = {fieldId: 2}
const _denialReasonML = {fieldId: 3}
// Edit Button
const _EditButton = {fieldId: 5}
const _currentStepNameHTML = {fieldId: 6}

// === Form Load Functions
onFormLoad()

// === Form Subscriptions Field
async function forSubscriptions (currentStepName) { if (testLogging) console.log("%c===FUNCTION CALLED(): forSubscriptions", "color: cyan", currentStepName)

    switch (currentStepName) {
        case "REVIEW":
            await LFForm.onFieldChange(readOnlyForm, _EditButton)
        case "ASSIGN":
            const subscription = [_clearanceDD, _denialReasonML].forEach(field => LFForm.onFieldChange(
                event => forDenialReasons(event), {fieldId: field['fieldId']}))
            break;
        default:
            return;
    }
}

// === Dynamic Form Field Functions
async function forDenialReasons (event) { if (testLogging) console.log("%c===FUNCTION CALLED(): forDenialReasons", "color: yellow", event)
    
    // Adjust Table on Form Launch
    if (!event) { if (testLogging) console.log("!!NO EVENT -- EXIT FUNCTION"); return }

    // Retrieve the Options
    let fieldObj =  { fieldId: event.options[0]['fieldId'], index: event.options[0]['index']}
    // console.log(event, fieldObj) // Test Logging ONLY!

    // Switch cases for different field Subscriptions
    switch (fieldObj.fieldId) {
        // Determine to hide / show Denial Reason
        case _clearanceDD['fieldId']: 
            let status = LFForm.getFieldValues(fieldObj)
            switch (status) {
                case "APPROVE":
                    await LFForm.setFieldValues({fieldId: _denialReasonML['fieldId'], index: fieldObj['index']}, "")
                    await LFForm.hideFields({fieldId: _denialReasonML['fieldId'], index: fieldObj['index']})
                    break;
                default: 
                    await LFForm.showFields({fieldId: _denialReasonML['fieldId'], index: fieldObj['index']})
                    break;
            }
            break;
        // Determine whether to ask for a case #
        case _denialReasonML['fieldId']:
            let denialReason = LFForm.getFieldValues({fieldId: _denialReasonML['fieldId'], index: fieldObj['index']})
            let arrest = /arrest/i.test(denialReason) 

            switch (arrest) {
                case true:
                    await LFForm.changeFieldSettings({fieldId: _denialReasonML['fieldId'], index: fieldObj['index']}, 
                        {subtext: "Please Include Case #"})
                    break;
                default:
                    await LFForm.changeFieldSettings({fieldId: _denialReasonML['fieldId'], index: fieldObj['index']}, 
                        {subtext: ""})
                    break;
            }
            break;
    }
}

function readOnlyForm () {  

    // Exclusion Fields
    let excludeFieldIds = [_EditButton['fieldId']]

    // Fetch all fields that aren't read Only
    let findFields = LFForm.findFields(
        f => ( f.settings.readOnly !== true && !excludeFieldIds.includes(f.settings.fieldId) && !['Page', 'Form'].includes(f.settings.componentType) )
    )
    // console.log(findFields) // Uncomment to see console log!

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

// === Form Load Functions Definition
async function hideOnLoad (currentStepName) { if (testLogging) console.log("%c===FunctionName: hideOnLoad()", "color: red", currentStepName)

    let hiddenSwitches = [_currentStepNameHTML]
    if (!['REVIEW'].includes(currentStepName)) hiddenSwitches.push(_EditButton)
    if (!['ASSIGN', 'REVIEW'].includes(currentStepName)) hiddenSwitches.push(_clearanceDD, _denialReasonML)
    if (testLogging) console.log(hiddenSwitches)
    if (hiddenSwitches.length > 0) {
        await LFForm.addSet(_approvalCOL, 1)
        await LFForm.hideFields(hiddenSwitches)
        await LFForm.deleteSet(_approvalCOL, 0)
    }
}

async function disableOnLoad (currentStepName) { if (testLogging) console.log("%c===FunctionName: disableOnLoad()", "color: red", currentStepName)

    let disableFields = [];
    if (['REVIEW'].includes(currentStepName)) {
        await LFForm.addSet(_approvalCOL, 1)
        disableFields.push(_approvalCOL, _employeeName, _clearanceDD, _denialReasonML)
        await LFForm.disableFields(disableFields)
        await LFForm.deleteSet(_approvalCOL, await LFForm.getFieldValues(_approvalCOL).length-1)
    }
    if (testLogging) console.log(disableFields)
}

async function onFormLoad () {

    let currentStepName = ""
    currentStepName = await LFForm.getFieldValues(_currentStepNameHTML)
    if (testLogging) currentStepName = "START"

    switch (currentStepName) {
        case "START":
            await LFForm.changeFormSettings({title: "Start Employee Clearance Application"})
            break;
        case "ASSIGN":
            await LFForm.changeFormSettings({title: "Assign Employee Clearance Approval"})
            break;
        case "REVIEW":
            await LFForm.changeFormSettings({title: "Review Employee Clearance Application"})
            break;
        default: // Assumes that Laserfiche Saves the Form to the Repository
            return;
    }

    if (testLogging) console.log("%c===FunctionName: onFormLoad()", "color: red", currentStepName)
    if (productionView) await hideOnLoad(currentStepName);
    await forSubscriptions(currentStepName)
} 