window.onload = function(){

    // localStorage persistence
    var STORAGE_KEY = 'todos-vuejs-2.0'

    var todoStorage = {
        //가져옴
        fetch: function () {

            //JSON.parse : 객체를 JSON으로 변환 시킨다.
            var todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
            todos.forEach(function (todo, index) {
                todo.id = index
            })
            todoStorage.uid = todos.length
            return todos
        },
        //저장
        save: function (todos) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
        }
    }

    // visibility filters (hash에 지정되어 있음)
    var filters = {
        all: function (todos) {
            return todos
        },
        active: function (todos) {
            return todos.filter(function (todo) {
            return !todo.completed
            })
        },
        completed: function (todos) {
            return todos.filter(function (todo) {
            return todo.completed
            })
        }
    }





    // app Vue instance
    var app = new Vue({
        data: {
            todos: todoStorage.fetch(),
            newTodo: '',
            editedTodo: null,
            visibility: 'all'
        },

        watch: {
            todos: {
            handler: function (todos) {
                todoStorage.save(todos)
            },
            deep: true
            }
        },

        computed: {
            filteredTodos: function () {
                return filters[this.visibility](this.todos)
            },
            remaining: function () {
                return filters.active(this.todos).length
            },
            allDone: {
                get: function () {
                    return this.remaining === 0
                },
                set: function (value) {
                    this.todos.forEach(function (todo) {
                        todo.completed = value
                    })
                }
            }
        },

        filters: {
            pluralize: function (n) {
                return n === 1 ? 'item' : 'items'
            }
        },

        methods: {
            addTodo: function () {
                var value = this.newTodo && this.newTodo.trim() //좌, 우 공백 제거
                if (!value) {
                    return  //value가 빈 값으면 return
                }
                //todos는 JSON데이터 열
                this.todos.push({
                    id: todoStorage.uid++,
                    title: value,
                    completed: false
                })
                //newTodo 초기화
                this.newTodo = ''
            },

            removeTodo: function (todo) {
                this.todos.splice(this.todos.indexOf(todo), 1)
            },

            editTodo: function (todo) {
                this.beforeEditCache = todo.title
                this.editedTodo = todo
            },

            doneEdit: function (todo) {
                if (!this.editedTodo) {
                    return
                }
                this.editedTodo = null
                todo.title = todo.title.trim()
                if (!todo.title) {
                    this.removeTodo(todo)
                }
            },

            cancelEdit: function (todo) {
                this.editedTodo = null
                todo.title = this.beforeEditCache
            },

            removeCompleted: function () {
                this.todos = filters.active(this.todos)
            }
        },

        directives: {
            //디렉티브(Directives) ??????????
            'todo-focus': function (el, binding) {
                if (binding.value) {
                    el.focus()
                }
            }
        }
    })

    // handle routing (경로 처리)
    function onHashChange () {
        //hash에서 #을 제외한 string만 변수에 담는다
        var visibility = window.location.hash.replace(/#\/?/, '')

        //app Vue의 data.visibility의 값을 업데이트 한다. 
        if (filters[visibility]) {
            app.visibility = visibility
        } else {
            window.location.hash = ''
            app.visibility = 'all'
        }
    }

    //addEventListener는 지정한 이벤트가 대상에 전달될 때마다 호출할 함수를 설정
    //hashchanges는 hash tag가 변경되면 이벤트 실행
    window.addEventListener('hashchange', onHashChange)

    // handle routing
    onHashChange()

    // mount
    // vue를 mount할 엘리먼트 지정
    app.$mount('.todoapp')
}