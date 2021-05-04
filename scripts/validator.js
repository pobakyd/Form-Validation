function Validator(formSelector){
    const __this = this
    const formElement = document.querySelector(formSelector)
    const validatorRules = {
        required(value){
            return value.trim() ? undefined : 'Vui lòng nhập trường này'
        },
        email(value){
            var regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
            return regex.test(value) ? undefined : 'Vui lòng nhập đúng email'
        },
        minLength(minLength){
            return (value) => value.length >= minLength ? undefined : `Vui lòng nhập mật khẩu nhiều hơn ${minLength} kí tự` 
        }
    }
    var formRules = {}
    if(formElement){
        // Xử lí khi submit form
        formElement.onsubmit = function(event){
            event.preventDefault()
            for(var [name, funcs] of Object.entries(formRules)){
                var domElement = document.querySelector(`[name = ${name}]`)
                var isSuccess = true
                isSuccess = handleValidator({target: domElement}) && isSuccess
            }
            // Khi không có lỗi thì submit form
            if(isSuccess){
                if(__this.onSubmit){
                    __this.onSubmit()
                }
                else{
                    formElement.submit()
                }
            }
        }

        // Xử lí với các thẻ input
        const enableInputs = formElement.querySelectorAll('[name][rules]:not([disable]')
        enableInputs.forEach(ele => {
            var rulesStr = ele.getAttribute('rules').split('|')
            var rulesFunc = rulesStr.map(ele => {
                if(ele.includes('min')){
                    var ruleMinLength = ele.split(':')
                    return validatorRules[ruleMinLength[0]](ruleMinLength[1])
                }
                else{
                    return validatorRules[ele]
                }
            })
            formRules[ele.name] = rulesFunc
            ele.onblur = handleValidator
            ele.oninput = clearValidator
        })

        // Xử lí các sự kiện trên thẻ input
        function handleValidator(event) {
            var element = event.target
            var rules = formRules[element.name]
            var errorMessage
            for(var func of rules){
                errorMessage = func(element.value)
                if(errorMessage) break
            }
            if(errorMessage){
                var formGroup = element.closest('.form-group')
                if(formGroup){
                    formGroup.classList.add('invalid')
                    var formMessageElement = formGroup.querySelector('.form-message')
                    if(formMessageElement){
                        formMessageElement.textContent = errorMessage
                    }
                }
            }
            return !errorMessage
        }

        // Clear validator khi người dùng đang nhập
        function clearValidator(event){
            var element = event.target
            var formGroup = element.closest('.form-group')
            if(formGroup){
                formGroup.classList.remove('invalid')
                var formMessageElement = formGroup.querySelector('.form-message')
                if(formMessageElement){
                    formMessageElement.textContent = ''
                }
            }
        }
    }
}