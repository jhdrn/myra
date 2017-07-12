import * as myra from 'myra'

const AppComponent = myra
    .define({ hello: 'Hello world' })
    .updates({
        onClick: ctx => ({ hello: `${ctx.state.hello} again` })
    })
    .view(({ state, updates }) =>
        <div onclick={updates.onClick}>{state.hello}</div>
    )

myra.mount(AppComponent, document.body)
