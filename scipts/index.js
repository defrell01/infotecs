/// Данная часть кода выглядит страшнее чем должна была быть
//  изначально функции получения данных с апишки, рендера и drag'n'drop'а
//  были зарефакторены и вынесены в отдельные файлы, но не знаю, в виду своей неопытности
//  у меня получалось подружить только 2 из трех (это пишется до написания второй части задания)
window.addEventListener("load", function () {

    /// начинаю с написания функции получения данных, ранее у меня был проект с
    // фейковой апишкой, поэтому беру данные оттуда
    // принимаю на вход ссылку на апишку и заранее подготовленный пустой массив,
    // куда и возвращаю результат

    // функции делаю асинхронными, поскольку я не знаю заранее сколько займет процесс

    const getItems = async function (url, arr) {

        await fetch(url).then(function (response) {
            return response.json();
        }).then(function (data) {
            arr = data
        }).catch(function (err) {
            console.warn('Something went wrong.', err);
        });

        return arr
    }
    
    // Добавляю функция фильтрации по бренду, для этого необходимо
    // получить данные из элемента селект
    // создаю фильтр по значению и если текст элемента li совпадает,
    // то декорейшн "", иначе убираю его

    const filterBrand = function () {
        let select = document.getElementsByTagName('select')[0]

        let filter = select.value.toUpperCase()

        let list = document.querySelector('#list')

        let li = list.getElementsByTagName('li')


        for (let i = 0; i < li.length; i++) {

            itemTxt = li[i].textContent || li[i].innerText

            if (itemTxt.toUpperCase().indexOf(filter) > -1) {
                li[i].style.display = ''
                console.log(li[i])
            }
            else {
                li[i].style.display = 'none'
                console.log(li[i])
            }
        }
    }

    // Функция для фильтрации количества предметов на странице,
    // просто пробегаюсь по массиву и если номер больше того, что
    // указан в инпуте - убираю, обратно же """

    const filterNumber = function () {
        let input = document.getElementsByTagName('input')[0]

        if (input.value > 0 && input.value <= 10) {

            let list = document.querySelector('#list')

            let li = list.getElementsByTagName('li')

            for (let i = 0; i < li.length; i++) {
                if (i >= input.value) {
                    li[i].style.display = 'none'
                }

                else {
                    li[i].style.display = ''
                }
            }
        }
    }
    // функция отображения результатов в элемент li, которые создаются
    // на вход принимаю массив объектов и лист, в который это ли и будут помещаться

    const renderItems = async function (array, element) {
        array.forEach(item => {
            const li = document.createElement('li')
            li.draggable = true
            // li.title = `Название: ${item.name}\nЦена: ${item.price} руб.` // всплывающее окно добавил через тайтл
            console.log(item.name)                                        // уверен, что далеко не лучший вариант,
            li.textContent = item.name

            // данный вариант явно лучше, еще и картинку позволяет отобразить)

            li.onmouseover = function () {
                let div = document.createElement('div')
                div.classList.add('overlay')
                div.textContent = `Название: ${item.name}\nЦена: ${item.price} руб.`
                let itemPic = document.createElement('img')
                itemPic.src = `.${item.imgUrl}`
                itemPic.classList.add('itemPic')
                div.appendChild(itemPic)
                document.body.appendChild(div)
            }

            li.onmouseout = function () {
                let div = document.querySelector('.overlay')
                document.body.removeChild(div)
            }
            element.appendChild(li)
        });

        // На данном этапе создаю кнопки для вывода фильтраций

        const btnFilter = document.createElement('button')
        btnFilter.onclick = function () {
            filterBrand()
        }

        btnFilter.classList.add('brandFilter')
        btnFilter.textContent = 'Фильтр'
        document.body.appendChild(btnFilter)


        const btnNumber = document.createElement('button')

        btnNumber.onclick = function () {
            filterNumber()
        }

        btnNumber.classList.add('numberFilter')
        btnNumber.textContent = 'Число эл.'
        document.body.appendChild(btnNumber)

    }



    // мэйн функция которая вызывает остальные и в которой так же описана логика драгндропа

    const main = async function () {
        let arr = []

        arr = await getItems('https://62b0c70c196a9e98702ab073.mockapi.io/items', arr)

        const list = document.querySelector('#list')

        await renderItems(arr, list)

        // ищу нужные элементы

        var items = document.querySelectorAll('#list li'),
            dragged = null

        // перебирая все элементы задаю класс подсказки для элеметов куда можно 
        // перетащить и активный для элмента куда перетаскиваетс, когда драг заканчивается
        // классы забираются, если можно так выразиться
        // через превет дефолт останавливаю действие если оно выполняется неявно
        // при перетаскиывании на элемент из позиции меняются местами благодаря отслеживанию позиции обоих

        for (let i of items) {

            i.addEventListener("dragstart", function () {
                dragged = this

                for (let it of items) {
                    if (it != dragged) { it.classList.add('hint') }
                }
            })

            i.addEventListener("dragenter", function () {
                if (this != dragged) { this.classList.add('active') }
            })

            i.addEventListener("dragleave", function () {
                this.classList.remove('active')
            })

            i.addEventListener("dragend", function () {
                for (let it of items) {
                    it.classList.remove('hint')
                    it.classList.remove('active')
                }
            })

            i.addEventListener("dragover", function (evt) {
                evt.preventDefault()
            })

            i.addEventListener("drop", function (evt) {
                evt.preventDefault()
                if (this != dragged) {
                    let all = document.querySelectorAll('#list li'),
                        draggedpos = 0, droppedpos = 0

                    for (let it = 0; it < all.length; it++) {
                        if (dragged == all[it]) { draggedpos = it }
                        if (this == all[it]) { droppedpos = it }
                    }

                    if (draggedpos < droppedpos) {
                        this.parentNode.insertBefore(dragged, this.nextSibling)
                    }
                    else { this.parentNode.insertBefore(dragged, this) }

                }
            })
        }
    }

    main()

})