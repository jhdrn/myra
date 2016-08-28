import { defineComponent, evolve, Update, View } from 'myra/core'
import * as jsxFactory from 'myra/html/jsxFactory'
import * as todos from '../models/todos'

type Todo = todos.Todo


/**
 * Model
 */
type Model = {
    editing: boolean
    todo: Todo
}
const init: Model = {
    editing: false,
    todo: {
        id: 0,
        completed: false,
        title: ''
    }
}


/**
 * Updates
 */
const mount: Update<Model, Todo> = (m, todo) => 
    evolve(m, x => {
        x.todo = todo!
    })

const saveTodo = (m: Model, value: string) => {
    const todo = value.trim()
    if (todo) {
        const updatedTodo = evolve(m.todo, t => { 
            t.title = todo
        })
        return [
            evolve(m, x => {
                x.editing = false
                x.todo = updatedTodo
            }),
            todos.save(updatedTodo)
        ]
    }
    else {
        return [
            m,
            todos.remove(m.todo.id)
        ]
    }
}

const editTodo = (m: Model) => {
    return evolve(m, x => {
        x.editing = true
    })
}

const undoEditTodo = (m: Model) => 
    evolve(m, x => {
        x.editing = false
    })

const toggleTodoCompleted = (m: Model) => {
    const updatedTodo = evolve(
        m.todo,
        t => t.completed = !m.todo.completed
    ) 
    return [
        evolve(m, x => 
            x.todo = updatedTodo 
        ),
        todos.save(updatedTodo)
    ]
}


/**
 * View
 */
const todoClass = (m: Model) => {
    if (m.todo.completed) {
        return 'completed'
    }
    else if (m.editing) {
        return 'editing'
    }
    return undefined
}

const editInputOrNothing = (model: Model) => 
    model.editing ? <input class="edit" 
                           focus="true"
                           value={ model.todo.title }
                           onblur={ saveTodo }
                           onkeyup_enter={{ listener: saveTodo, preventDefault: true }}
                           onkeyup_escape={{ listener: undoEditTodo, preventDefault: true }} />
                  : <nothing />

const view: View<Model> = (model) =>
    <li class={ todoClass(model) }>
        <div class="view">
            <input class="toggle" 
                   type="checkbox" 
                   checked={ model.todo.completed }
                   onclick={ toggleTodoCompleted } />
            
            <label ondblclick={ model.todo.completed ? undefined : editTodo }>{ model.todo.title }</label>
            <button class="destroy" onclick={ todos.remove(model.todo.id) }></button>
        </div>
        { editInputOrNothing(model) }
    </li>


/**
 * Component
 */
export const todoItemComponent = defineComponent<Model, Todo>({
    name: 'TodoItemComponent',
    init: init,
    mount: mount,
    view: view
})