function Validator(options) {
    // store list rules of selectors
    var selectorRules = {

    }
    // Utilities function
    function validate(inputElement, rule){
        var formGroup = inputElement.closest(options.formGroup)
        var formMessage = formGroup.querySelector(options.errorMessage)
        // get functions isValid of rule
        var rules = selectorRules[rule.selector]
        var errorMessage
        for(var i in rules){
            switch (inputElement.type) {
                case 'checkbox':
                case 'radio':
                    errorMessage = rules[i]((document.querySelector(rule.selector + ':checked') && document.querySelector(rule.selector + ':checked').value) || '')
                    break
                default:
                    errorMessage = rules[i](inputElement.value)
                    break
            }
            if (errorMessage){
                formGroup.classList.add('invalid')
                formMessage.textContent = errorMessage
                return false// dừng việc kiểm tra nếu có lỗi
            }
            else{
                formGroup.classList.remove('invalid')
                formMessage.textContent = ''
            }
        }
        return true
    }


    var formElement = document.querySelector(options.form)
    if(formElement){
        // Xử lí khi submit form
        formElement.onsubmit = (e) => {
            e.preventDefault()
            var isSuccess = true
            // Lặp qua từng rule và validate
            options.rules.forEach((rule) => {
                var inputElements = [...formElement.querySelectorAll(rule.selector)]
                inputElements.forEach(inputElement => {
                    isSuccess = validate(inputElement, rule) && isSuccess
                })
            })
            if(isSuccess){
                // trường hợp submit với javascript
                if(typeof options.onSubmit === 'function'){
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])')
                    var formValues = [...enableInputs].reduce((acc,ele) => {
                        switch (ele.type) {
                            case 'radio':
                                ele.checked ? acc[ele.name] = ele.value : undefined
                                break
                            case 'checkbox':
                                if(ele.checked){
                                    acc[ele.name] ? acc[ele.name].push(ele.value) : acc[ele.name] = [ele.value]
                                }
                                break
                            case 'file':
                                acc[ele.name] = ele.files 
                                break;
                            default:
                                acc[ele.name] = ele.value
                                break
                        }
                        return acc
                    }, {})
                    options.onSubmit(formValues)
                }
                // submit với hành vi mặc định
                else{
                    formElement.submit()
                }
            }
        }

        // Lặp qua mỗi rule và xử lí
        options.rules.forEach((rule) => {
            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.isValid)
            }
            else{
                selectorRules[rule.selector] = [rule.isValid]
            }
            var inputElements = [...formElement.querySelectorAll(rule.selector)]
            var formGroup = inputElements[0].closest(options.formGroup)
            var formMessage = formGroup.querySelector(options.errorMessage)  
            inputElements.forEach(inputElement => {
                inputElement.onblur = () => {
                    validate(inputElement, rule)
                }
                inputElement.oninput = () => {
                    formGroup.classList.remove('invalid')
                    formMessage.textContent = ''
                }
            })
        })
    }
}

// validate required field
Validator.isRequired = function (selector, errorMessage){
    return {
        selector,
        isValid(value){
            return value.trim() ? undefined : errorMessage || 'Vui lòng nhập trường này'
        }
    }
}

// validate valid email
Validator.isEmail = function (selector, errorMessage){
    return {
        selector,
        isValid(value){
            var regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
            return regex.test(value) ? undefined : errorMessage || 'Vui lòng nhập đúng email'
        }
    }
}

// validate min length of field
Validator.minLength = function (selector, minLength, errorMessage){
    return {
        selector,
        isValid(value){
            return value.length >= minLength ? undefined : errorMessage || `Vui lòng nhập mật khẩu nhiều hơn ${minLength} kí tự` 
        }
    }
}

// validate re-enter field
Validator.isConfirmed = function (selector, getPassword, errorMessage){
    return {
        selector,
        isValid(value){
            return value === getPassword() ? undefined : errorMessage || 'Giá trị nhập vào không chính xác'
        }
    }
}