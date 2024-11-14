// === Environment Variables
const testStep = ["ASSIGN"] // Change preview to specific Form Step
const testLogging = [false] // show console messages + ENABLE TEST STEP
const testData = [false] // preload form with testData
const productionView = [true] // access / view of fields switch

// === Form Constants ===
const freezeFunctions = [0]
const logColor = {
    onLoad: "orange",
    subscription: "cyan",
    lookup:"light green",
    event: "pink",
    utility: "yellow"
}

// === Form Field Declarations ===
// Approval Collection
const _approvalCOL = {fieldId: 1}
const _employeeName = {fieldId: 2}
const _clearanceDD = {fieldId: 5}
const _denialReasonML = {fieldId: 4}
// Edit Button
const _EditButton = {fieldId: 6}

// === Form Load Functions
onFormLoad()

// === Form Subscriptions
async function forSubscriptions (currentStepName) { if (testLogging[0]) console.log("%c===FUNCTION CALLED(): forSubscriptions", `color: ${logColor.subscription}`, currentStepName)

    switch (currentStepName) {
        case "REVIEW":
            await LFForm.onFieldChange(readOnlyForm, _EditButton)
        case "ASSIGN":
            const subscription = [_clearanceDD, _denialReasonML].forEach(field => LFForm.onFieldChange(
                (event) => {if (!freezeFunctions[0]) forDenialReasons(event) }, {fieldId: field['fieldId']}))
            break;
        default:
            return;
    }
}

// === Dynamic Form Field Functions
async function forDenialReasons (event) { if (testLogging[0]) console.log("%c===FUNCTION CALLED(): forDenialReasons", `color: ${logColor.event}`, event, freezeFunctions)
    
    if (!testData[0]) freezeFunctions.fill(1);
    
    // Adjust Table on Form Launch
    if (!event) {

        // If the table is empty, we need the field populated to alter
        let COLsize = LFForm.getFieldValues(_approvalCOL)
        if (COLsize.length < 1) await LFForm.addSet(_approvalCOL)

        await LFForm.hideFields(_denialReasonML)
        await LFForm.deleteSet(_approvalCOL, 0) // IF set does not need rows to submit Form

        freezeFunctions.fill(0)

        return; // exit the function and do not process further
    }

    // Retrieve the Options
    let fieldObj =  { fieldId: event.options[0]['fieldId'], index: event.options[0]['index']}
    if (testLogging[0]) console.log("---Event + fieldObj:", event, fieldObj) // Test Logging ONLY!

    // Switch cases for different field Subscriptions
    switch (fieldObj.fieldId) {
        // Determine to hide / show Denial Reason
        case _clearanceDD['fieldId']: 
            let status = LFForm.getFieldValues(fieldObj)
            switch (status) {
                case "APPROVE":
                    await LFForm.setFieldValues({fieldId: _denialReasonML['fieldId'], index: fieldObj['index']}, "")
                    await LFForm.changeFieldSettings({fieldId: _employeeName['fieldId'], index: fieldObj['index']}, {CSSClasses: ""})
                    await LFForm.hideFields({fieldId: _denialReasonML['fieldId'], index: fieldObj['index']})
                    break;
                default: 
                    await LFForm.showFields({fieldId: _denialReasonML['fieldId'], index: fieldObj['index']})
                    await LFForm.changeFieldSettings({fieldId: _employeeName['fieldId'], index: fieldObj['index']}, {CSSClasses: "denied"})
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

    freezeFunctions.fill(0);
    return;
}

function readOnlyForm () { if (testLogging[0]) console.log("%c===FUNCTION CALLED(): readOnlyForm", `color: ${logColor.subscription}`)

    // Exclusion Fields
    let excludeFieldIds = [_EditButton['fieldId']]

    // Fetch all fields that aren't read Only
    let findFields = LFForm.findFields(
        f => ( f.settings.readOnly !== true && !excludeFieldIds.includes(f.settings.fieldId) && !['Page', 'Form'].includes(f.settings.componentType) )
    ) 
    if (testLogging[0]) console.log(findFields) // Uncomment to see console log!

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
async function hideOnLoad (currentStepName) {  if (testLogging[0]) console.log("%c===FunctionName: hideOnLoad() CALLED", `color: ${logColor.onLoad}`, currentStepName)

  let hiddenSwitches = []
  if (!['REVIEW'].includes(currentStepName)) hiddenSwitches.push(_EditButton)
  if (!['ASSIGN', 'REVIEW'].includes(currentStepName)) hiddenSwitches.push(_clearanceDD, _denialReasonML)
  if (testLogging[0]) console.log(hiddenSwitches)
  if (hiddenSwitches.length > 0) {
    await LFForm.addSet(_approvalCOL, 1)
    await LFForm.hideFields(hiddenSwitches)
    await LFForm.deleteSet(_approvalCOL, 0)
  }
}

async function disableOnLoad (currentStepName) {  if (testLogging[0]) console.log("%c===FunctionName: disableOnLoad() CALLED", `color: ${logColor.onLoad}`, currentStepName)

  let disableFields = [];
  if (['REVIEW'].includes(currentStepName)) {
    await LFForm.addSet(_approvalCOL, 1)
    disableFields.push(_approvalCOL, _employeeName, _clearanceDD, _denialReasonML)
    await LFForm.disableFields(disableFields)
    await LFForm.deleteSet(_approvalCOL, LFForm.getFieldValues(_approvalCOL).length-1)
  }
  if (testLogging[0]) console.log(disableFields)
}


async function onFormLoad () { 

    if ((LFForm.isPreview && !testLogging[0]) || LFForm.isPrint) return; // Don't execute Code
    let currentStepName = LFForm.step.name
    if (testLogging[0]) currentStepName = testStep[0]

    switch (currentStepName) {
        case "APPLICATION": // Employees are selected for clearance
           await LFForm.changeFormSettings({title: "APPLICATION Employee Clearance Application"})
           break;
        case "ASSIGN": // Employees are assigned Clearance
            await LFForm.changeFormSettings({title: "Assign Employee Clearance Approval"})
            break;
        case "REVIEW": // Supervisor approves
            await LFForm.changeFormSettings({title: "Review Employee Clearance Applications"})
            break;
        default:
            return;
    }

    if (testLogging[0]) console.log("%c===FunctionName: onFormLoad() CALLED", `color: ${logColor.onLoad}`, "Step:", currentStepName, "LFForm:", LFForm)
    if (productionView[0]) await disableOnLoad(currentStepName); await hideOnLoad(currentStepName);
    await forSubscriptions(currentStepName)
    if (testData) { await testEnviroment(currentStepName); }
}

// === Utility Functions
async function testEnviroment (currentStepName) { if (testLogging[0]) console.log("%c===FunctionName: testEnviroment() CALLED", `color: ${logColor.onLoad}`, currentStepName)

  let shuffle = Math.floor(Math.random() * 2);
  if (testLogging[0]) console.log(`Testing Scenario ${shuffle} called!`)
  let employeeTest;

  switch (shuffle) {
    case 0:
      employeeTest = { 
        employeeName: ["Henry Bisquick", "Thomas DiGiorno III", "Beef Thompson", "Lovely Loverson", "Mr Nice Nice", "The Sublimer"], 
        policeApproval: ["APPROVE", "APPROVE", "DENY", "APPROVE", "APPROVE", "APPROVE"], 
        denialReason: ["", "", "Arrested", "", "", ""]
      }
      break;
    default:
      employeeTest = { 
        employeeName: ["Martha Washington Jr", "Haley OBoodle", "Seraphina Chequeormoneeorderr", "Lovely Loverson", "Mr Nice Nice", "The Sublimer"], 
        policeApproval: ["APPROVE", "DENY", "APPROVE", "APPROVE", "APPROVE", "APPROVE"], 
        denialReason: ["", "Needs more Information", "", "", "", ""]
      }
    }

  await LFForm.addSet(_approvalCOL, employeeTest.employeeName.length)
  switch (currentStepName) {
    case "ASSIGN":
    case "REVIEW":
        employeeTest.policeApproval.forEach(async (x, i) => {
            await LFForm.setFieldValues({fieldId:_clearanceDD['fieldId'], index: i}, x)
        })
        employeeTest.denialReason.forEach(async (x, i) => {
            await LFForm.setFieldValues({fieldId:_denialReasonML['fieldId'], index: i}, x)
        })
    break;
    default:
        break;
  }
  await LFForm.setFieldValues(_employeeName, employeeTest.employeeName) 
  testData.fill(false) // Test data Entered!
  return;
}