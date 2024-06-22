LFForm.onFieldChange((event) => console.log(event), {fieldId: 1})

const subscription = [{fieldId: 2}, {fieldId: 3}, {fieldId: 4}].forEach(field =>
    LFForm.onFieldChange((event) => console.log(event), {fieldId: field['fieldId']})
    )