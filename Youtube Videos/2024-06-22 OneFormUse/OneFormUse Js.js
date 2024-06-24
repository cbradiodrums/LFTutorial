// === Environment Variables
const testLogging = false // show console messages
const testData = false // preload form with testData
const productionView = true // always keep fields in view

// === Form Field Declarations ===
const _PageMain = {fieldId: 1}
const _PageInstructions = {fieldId: 2}
const _SL = {fieldId: 3}
// Approval Collection
const _approvalCOL = {fieldId: 1}
const _employeeName = {fieldId: 4}
const _clearanceDD = {fieldId: 2}
const _denialReasonML = {fieldId: 3}
// Edit Button
const _EditButton = {fieldId: 5}
const a_currentStepNameHTML = {fieldId: 6}

// === Form Load Functions
onFormLoad()

// === Form Subscriptions
async function forSubscriptions (currentStepName) { if (testLogging) console.log("%c===FUNCTION CALLED(): forSubscriptions", "color: cyan", currentStepName)

    switch (currentStepName) {
        case "REVIEW":
            await LFForm.onFieldChange(readOnlyForm, _EditButton)
            break;
        default:
            await LFForm.hideFields(_EditButton, _clearanceDD, _denialReasonML)
            break;
    }
    forDenialReasons()
    const subscription = [_clearanceDD, _denialReasonML].forEach(field => LFForm.onFieldChange(
        event =>  forDenialReasons(event) , {fieldId: field['fieldId']}))

    
}

// === Dynamic Form Field Functions
async function forDenialReasons (event) { console.log(event)
    
    // Adjust Table on Form Launch
    if (!event) {

        // If the table is empty, we need the field populated to alter
        let COLsize = LFForm.getFieldValues(_approvalCOL)
        if (COLsize.length < 1) await LFForm.addSet(_approvalCOL)

        await LFForm.hideFields(_denialReasonML)
        await LFForm.deleteSet(_approvalCOL, 0) // IF set does not need rows to submit Form

        return; // exit the function and do not process further
    }

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


// === Form Load Functions
async function hideOnLoad () {  if (testLogging) console.log("%c===FunctionName: hideOnLoad() CALLED", "color: red")

  let hiddenSwitches = []
  if (hiddenSwitches.length > 0) LFForm.hideFields(hiddenSwitches)
}

async function disableOnLoad () {  if (testLogging) console.log("%c===FunctionName: disableOnLoad() CALLED", "color: red")

  // Trigger Switch to Disable the Correct Email Collection Fields
  let disableFields = [];
  if (disableFields.length > 0) LFForm.disableFields(disableFields)
}


async function onFormLoad () { 

    let currentStepName = ""
    if (testLogging) currentStepName = "REVIEW"

    switch (currentStepName) {
        case "START":
            if (testData) await testEnviroment(currentStepName)
            break;
        case "REVIEW":
            if (testData) await testEnviroment(currentStepName)
            break;
        default:
            return;
    }
    if (testLogging) console.log("%c===FunctionName: onFormLoad() CALLED", "color: red", currentStepName)
    forSubscriptions(currentStepName)
}

// === Utility Functions
async function testEnviroment (currentStepName) { if (testLogging) console.log("===FunctionName: testEnviroment() CALLED", currentStepName)

  let shuffle = Math.floor(Math.random() * 2);
  if (testLogging) console.log(`Testing Scenario ${shuffle} called!`)
  let employeeTest;

  switch (shuffle) {
    case 0:
      employeeTest = { employeeName: ["Henry Bisquick", "Thomas DiGiorno III", "Beef Thompson", "Lovely Loverson", "Mr Nice Nice", "The Sublimer"], 
      policeApproval: ["APPROVE", "APPROVE", "DENY", "APPROVE", "APPROVE", "APPROVE"], 
      denialReason: ["", "", "Arrested", "", "", ""]
      }
      break;
    default:
      employeeTest = { employeeName: ["Martha Washington Jr", "Haley OBoodle", "Seraphina Chequeormoneeorderr", "Lovely Loverson", "Mr Nice Nice", "The Sublimer"], 
      policeApproval: ["APPROVE", "DENY", "APPROVE", "APPROVE", "APPROVE", "APPROVE"], 
      denialReason: ["", "Needs more Information", "", "", "", ""]
      }
    }

  await LFForm.addSet(_approvalCOL, employeeTest.employeeName.length)
  switch (currentStepName) {
    case "REVIEW":
        await LFForm.setFieldValues(_clearanceDD, employeeTest.policeApproval)
        await forDenialReasons() // Need something to reveal the denial forms.
        await LFForm.setFieldValues(_denialReasonML, employeeTest.denialReason)
    break;
    default:
        break;
  }
  await LFForm.setFieldValues(_employeeName, employeeTest.employeeName) 
  // disableOnLoad();
  return;
}