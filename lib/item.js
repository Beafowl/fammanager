const { print, resolveGoldAmount } = require('./helper');

const item = async (dbClient, item_name, worth, amount, msg) => {

    worth = resolveGoldAmount(worth);

    // check if item exists

    let res = await dbClient.query(`select * from item where item_name = '${item_name}'`)
    .catch((e) => {

        // console.error(e);
        print('An error has occured while executing the item command');
        msg.react('❌');
    });

    if (!res.rowCount) { // item does not exist, insert it

        res = await dbClient.query(`insert into item(item_name, worth, amount) values('${item_name}', ${worth}, ${amount})`)
        .then((res) => {

            print(`A new item has been inserted: ${amount} ${item_name}, each one worth ${worth}`);
            msg.react('👌');
        })
        .catch(() => {

            // console.error(e);
            print('An error has occured while executing the item command');
            msg.react('❌');
        });

    } else { // item exists, just update the table

        res = await dbClient.query(`update item set worth = ${worth}, amount = ${amount} where item_name = '${item_name}'`)
        .then((res) => {

            print(`An item has been updated: ${amount} ${item_name}, each one worth ${worth}`);
            msg.react('👌');
        })
        .catch(() => {

            // console.error(e);
            print('An error has occured while executing the item command');
            msg.react('❌');
        });
    }
}

module.exports = {

    item
}