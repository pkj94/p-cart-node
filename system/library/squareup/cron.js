let squareup_dir = __dirname;

require(squareup_dir + '/cron_functions.js');

if (index = squareup_init(squareup_dir)) {
    require(index);
}