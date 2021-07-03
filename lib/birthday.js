const { print } = require('./helper');

const birthday = async (pgClient, msg, discord_name, birthday_date) => {

    if (!birthday_date) {

        print('An error has occurred while executing the birthday command');
        msg.react('❌');
        return;
    }

    let res = await pgClient.query(`select * from birthday where discord_name = '${discord_name}'`);

    if (!res.rowCount) { // no date for this user, include him

        res = await pgClient.query(`insert into birthday(birthday_date, discord_name) values(TO_DATE('${birthday_date}', 'DD.MM.YYYY'), '${discord_name}')`)
        .then(() => {

            print(`Birthday of ${discord_name} has been added: ${birthday_date}`);
            msg.react('👌');
        }).catch((e) => {

            //console.error(e);
            print('An error has occurred while executing the birthday command');
            msg.react('❌');
        });

    } else {

        res = await pgClient.query(`update birthday set birthday_date = TO_DATE('${birthday_date}', 'DD.MM.YYYY') where discord_name = '${discord_name}'`)
        .then(() => {

            print(`Birthday of ${discord_name} has been updated to ${birthday_date}`);
            msg.react('👌');
        }).catch((e) => {

            //console.error(e);
            print('An error has occurred while executing the birthday command');
            msg.react('❌');
        });
    }
}

module.exports = {

    birthday
}