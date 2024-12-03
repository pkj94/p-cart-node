global.advertiseGoogleValidate = () => {
    if (!process.env.ADVERTISE_GOOGLE_CRON) {
        console.error("Not in Command Line.");
        process.exit(1);
    }
}

global.advertiseGoogleChdir = (currentDir) => {
    const rootDir = expressPath.resolve(currentDir, '../../..');
    process.chdir(rootDir);
    return rootDir;
}

global.advertiseGoogleDefineRoute = () => {
    global.ADVERTISE_GOOGLE_ROUTE = 'extension/advertise/google/cron';
    global.route = global.ADVERTISE_GOOGLE_ROUTE;
}

global.advertise_google_init = (currentDir) => {
    // Validate environment
    // advertiseGoogleValidate();

    // Set up default server vars
    process.env.HTTP_HOST = process.env.CUSTOM_SERVER_NAME;
    process.env.SERVER_NAME = process.env.CUSTOM_SERVER_NAME;
    process.env.SERVER_PORT = process.env.CUSTOM_SERVER_PORT;

    // Change root dir
    const rootDir = advertiseGoogleChdir(currentDir);

    advertiseGoogleDefineRoute();

    const indexPath = expressPath.join(rootDir, 'index.js');
    if (fs.existsSync(indexPath)) {
        return indexPath;
    }
}
