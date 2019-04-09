import * as myra from '../../../../src/myra'

function throwError(from: string) {
    throw Error(from)
}

export const ErrorComponent = myra.useContext((_p, ctx) => {

    ctx.useErrorHandler(err =>
        <div>
            <h2>Oops! An error occured</h2>
            <p>{err}</p>
        </div>
    )
    // Uncomment any of the following lines to test error handling in different
    // contexts
    //throwError('initialization')
    //ctx.didMount = () => throwError('didMount')
    //ctx.didRender = () => throwError('didRender')
    //ctx.shouldRender = () => throwError('shouldRender')
    //ctx.willMount = () => throwError('willMount')
    //ctx.willRender = () => throwError('willRender')

    return (
        <div>This will never be displayed because {throwError('view')}</div>
    )
})