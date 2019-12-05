# sophscript
Sophie's csv parser

The node script takes 3 arguments. 
1) path of the directory with your target sequences
2) path of the transform csv
3) output file path

The script will look in the target directory for .seq files; open each; look in the transform csv for any matching transforms; slice the sequence as defined in the transform; reverse, complement and reverse comlement the sequence, and output it at the directed file location.

See [example transform](./example_transform.csv) and the [example inputs](./example_inputs) for intended file setup.

#### Usage
install [nodejs](https://nodejs.org/en/)

install the dependencies
`npm install`

test the installation
`npm run test`

usage:
`node ./index.js <input_directory> <transform.csv> <output.csv>`

