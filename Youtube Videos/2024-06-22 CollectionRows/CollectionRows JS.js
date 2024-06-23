// === Form Field Declarations ===
const _approvalCOL = {fieldId: 1}
const _clearanceDD = {fieldId: 2}
const _denialReasonML = {fieldId: 3}

// === Form Subscriptions ===
forDenialReasons()
const subscription = [_clearanceDD, _denialReasonML].forEach(field => LFForm.onFieldChange(
    event =>  forDenialReasons(event) , {fieldId: field['fieldId']}))

// === Dynamic Form Functions ===
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