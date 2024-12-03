const current_dir = __dirname;

require(current_dir + '/cron_functions');
let index = advertise_google_init(current_dir)
if (index) {
    require(index);
}