const backupLib = require('backup');

const backup = (msg) => { 

    backupLib.backup('/usr/src/discordbot/postgresql/pgdata', '/backup/fammanager.backup', (err, filename) => {

        if (err) {
            console.error(err);
            msg.react('❌');
        } else {
            console.log(`Backup has been done: ${filename}`);
            msg.react('👌');
        }
    });
}

const restore = (msg) => {

    backupLib.restore('/backup/fammanager.backup', '/usr/src/discordbot/postgresql/pgdata', (err, filename) => {

        if (err) {
            console.error(err);
            msg.react('❌');
        } else {
            console.log(`Backup has been done: ${filename}`);
            msg.react('👌');
        }
    });
}

module.exports = {

    backup,
    restore
}