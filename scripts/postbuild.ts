const fs = require('fs')

const definitionsFile = 'dist/myra.d.ts'



// dts-bundle is removing 'declare' so this is an ugly way to bring it back
// again
fs.readFile(definitionsFile, 'utf8', (err, data) => {
    if (err) {
        throw err
    }

    const result = data.replace('global  {', 'declare global {')

    fs.writeFile(definitionsFile, result, 'utf8', err => {
        if (err) {
            throw err
        }

        // Add 'export as namespace myra' to declaration file.
        fs.appendFile(definitionsFile, 'export as namespace myra', (err) => {
            if (err) {
                throw err
            }
        })
    })
})