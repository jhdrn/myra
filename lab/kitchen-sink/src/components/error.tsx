import * as myra from '../../../../src/myra'

interface Props {
    forceUpdate: number
}

function throwError(from: string): undefined {
    throw Error(from)
}

export const ErrorComponent = (_: Props) => {

    myra.useErrorHandler(err =>
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
}