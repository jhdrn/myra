import * as myra from '../src/myra'

const q = (x: string) => document.querySelector(x)

describe('fragment', () => {

    it('renders fragment content', done => {

        const Component = () => <><div id="root" /></>

        myra.mount(<Component />, document.body)

        requestAnimationFrame(() => {
            const rootNode = q('body > #root')

            expect(rootNode).not.toBeNull()

            done()
        })
    })
})
