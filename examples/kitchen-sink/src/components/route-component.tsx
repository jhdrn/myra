import * as myra from 'myra'


/**
 * State
 */
type Props = { param: string }


/**
 * Component
 */
export default (props: Props) =>
    <p>Hello route, with param: {props.param}</p>