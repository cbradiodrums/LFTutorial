// === Form Constants ===
const freezeFunctions = [0]

// === Form Field Declarations ===
const _approvalCOL = {fieldId: 1}
const _clearanceDD = {fieldId: 5}
const _denialReasonML = {fieldId: 4}

// === Form Subscriptions ===
forDenialReasons()
const subscription = [_clearanceDD, _denialReasonML].forEach(field => LFForm.onFieldChange(
    (event) => { if (!freezeFunctions[0]) forDenialReasons(event)}, {fieldId: field['fieldId']}))

// === Dynamic Form Functions ===
async function forDenialReasons (event) { console.log("===Event Paramter:", event, freezeFunctions)

    freezeFunctions.fill(1)
    
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
    console.log("---Event + fieldObj:", event, fieldObj) // Test Logging ONLY!

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

    freezeFunctions.fill(0)
}

/* Explanation Process:
Step 1: Define Fields and 
    forDenialReason() ON LAUNCH 
    (SKIP subscription)
Step 2a: SHOW Subscription, Retrieve the
     Options and show the dynamic 
     show / hide use case
Step 2b: Retrieve the Options and 
    show how responsive the form is 
    using case #.
Step 3 (FINAL): Explain bad practices 
    and callback hell. freezeFunctions
*/