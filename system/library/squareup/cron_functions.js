
global.squareup_validate = () => {
    if (process.argv[0] !== 'node') {
        console.error('Not in Command Line.');
        process.exit(1);
    }
}

global.squareup_chdir = (currentDir) => {
    const rootDir = expressPath.resolve(currentDir, '../../..');
    process.chdir(rootDir);
    return rootDir;
}

global.squareup_define_route = () => {
    global.SQUAREUP_ROUTE = 'extension/recurring/squareup/recurring';
    global.route = global.SQUAREUP_ROUTE;
}

global.squareup_init = (currentDir) => {
    // Validate environment
    // squareup_validate();

    // Set up default server vars
    if (process.argv.length >= 4) {
        process.env.HTTP_HOST = process.argv[2];
        process.env.SERVER_NAME = process.argv[2];
        process.env.SERVER_PORT = process.argv[3];
    } else {
        process.env.HTTP_HOST = 'localhost';
        process.env.SERVER_NAME = 'localhost';
        process.env.SERVER_PORT = 80;
    }

    process.env.SERVER_NAME = process.env.SERVER_NAME;

    // Change root dir
    const rootDir = squareup_chdir(currentDir);

    squareup_define_route();

    if (fs.existsSync(expressPath.join(rootDir, 'index.js'))) {
        return expressPath.join(rootDir, 'index.js');
    }

    return null;
}
