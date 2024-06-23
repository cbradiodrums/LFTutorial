// === Environment Variables
const testLogging = false // show console messages
const testData = false // preload form with testData
const productionView = true // always keep fields in view

// === Form Field Declarations ===
const _PageMain = {fieldId: 1}
const _PageInstructions = {fieldId: 2}
const _SL = {fieldId: 3}
const _approvalCOL = {fieldId: 4}
const _clearanceDD = {fieldId: 5}
const _denialReasonML = {fieldId: 6}
const _EditButton = {fieldId: 7}

// === Form Load Functions
onFormLoad()

// === Form Subscriptions
async function forSubscriptions (currentStepName) { if (testLogging) console.log("%c===FUNCTION CALLED(): forSubscriptions", "color: cyan", currentStepName)
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


// === Form Load Functions
async function hideOnLoad () {  if (testLogging) console.log("===FunctionName: hideOnLoad() CALLED")

  let hiddenSwitches = []
  if (hiddenSwitches.length > 0) LFForm.hideFields(hiddenSwitches)
}

async function disableOnLoad () {  if (testLogging) console.log("===FunctionName: disableOnLoad() CALLED")

  // Trigger Switch to Disable the Correct Email Collection Fields
  let disableFields = [];
  if (disableFields.length > 0) LFForm.disableFields(disableFields)
}


async function onFormLoad () { 

    let currentStepName = ""
    if (testLogging) currentStepName = ""

    switch (currentStepName) {
        case "START":
            break;
        case "REVIEW":
            break;
        default:
            return;
    }
    forSubscriptions(currentStepName)
}

// === Utility Functions
async function testEnviroment () { if (testLogging) console.log("===FunctionName: testEnviroment() CALLED")

  let shuffle = Math.floor(Math.random() * 2);
  if (testLogging) console.log(`Testing Scenario ${shuffle} called!`)
  let employeeTest;

  switch (shuffle) {
    case 0:
      employeeTest = { applicantName: ["Henry Bisquick", "Thomas DiGiorno III", "Beef Thompson", "Lovely Loverson", "Mr Nice Nice", "The Sublimer"], 
      policeApproval: ["APPROVED", "APPROVED", "DENIED", "APPROVED", "APPROVED", "APPROVED"], 
      denialReason: ["", "", "He Bad", "", "", ""]
      }
      break;
    default:
      employeeTest = { applicantName: ["Martha Washington Jr", "Haley OBoodle", "Seraphina Chequeormoneeorderr", "Lovely Loverson", "Mr Nice Nice", "The Sublimer"], 
      policeApproval: ["APPROVED", "DENIED", "APPROVED", "APPROVED", "APPROVED", "APPROVED"], 
      denialReason: ["", "Chitty Chitty bang Bang", "", "", "", ""]
      }
    }

  await LFForm.addSet(_EmployeeCOL, employeeTest.applicantName.length)
  // await LFForm.setFieldValues(_EmployeeDenialReason, employeeTest.denialReason)
  // await LFForm.setFieldValues(_EmployeePoliceApproval, employeeTest.policeApproval)
  await LFForm.setFieldValues(_EmployeeName, employeeTest.applicantName) 
  // disableOnLoad();
  return;
}