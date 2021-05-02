const { print, resolveGoldAmount } = require('./helper');

// adds an user to the donator list.
// dbClient: database client
// discord: discord tag
// user: ingame name
// amount: amount to donate, can be undefined
// msg: msg that will be reacted to

const add = async (dbClient, discord, user, amount, item, msg) => {

    // calculate worth

    let worth = 0;

    if (item == undefined) {
        
        if (amount)
            worth = resolveGoldAmount(amount); 

    } else {

        let res = await dbClient.query(`select worth from item where item_name = '${item}'`)
        worth = res.rows[0].worth * amount;
    }

    // set query (either add user or change donation amount)

    let dbQuery;

    let res = await dbClient.query(`select * from fammanager where discord_name = '${discord}'`);

    if (res.rowCount) // change user
        dbQuery = `update fammanager set donation_amount_weekly = ${worth} where discord_name = '${discord}' and ingame_name = '${user}'`;
    else // add user
        dbQuery = `insert into fammanager(discord_name, ingame_name, donation_amount_weekly) values('${discord}', '${user}', ${amount == undefined ? 0 : worth})`;

    await dbClient.query(dbQuery)
    .then(() => {

        print(`${msg.author.tag} / ${user} has been added to the list`);
        msg.react('👌');

    }).catch((e) => {

        //console.error(e);
        print('An error has occurred while executing the add command');
        msg.react('❌');
    });

}

// removes an user from the donator list.
// dbClient: database client
// discord: discord tag, can be undefined
// user: ingame name
// msg: msg that will be reacted to

const remove = (dbClient, discord, user, msg) => {

    dbClient.query(`delete from fammanager where discord_name = '${discord}'` + (user == undefined ? '' : ` and ingame_name = '${user}'`))
    .then(() => {

        print(`${msg.author.tag} has removed himself from the list`);
        msg.react('👌');

    }).catch((e) => {

        //console.error(e);
        print('An error has occurred while executing the remove command');
        msg.react('❌');
    });
}

// user pays and date will eventually be extended
// dbClient: database client
// discord: discord tag
// amount: either gold amount when item is undefined or amount of the specified item
// item: item that will be donated
// msg: msg that will be reacted to

const pay = async (dbClient, discord, amount, item, msg) => {

    if (item == undefined) { // gold will be donated, !pay [Amount] has been invoked

        amount = resolveGoldAmount(amount);

        await dbClient.query(`update fammanager set donation_amount = donation_amount + ${amount}, donation_total = donation_total + ${amount} where discord_name = '${discord}'`)
        .then((res) => {

            print(`${discord} paid ${amount} Gold`);
            msg.react('👌');

        }).catch((e) => {

            //console.error(e);
            print('An error has occurred while executing the pay command');
            msg.react('❌');
        });

    } else { // an item with a specified amount will be donated, !pay [Amount] [Item] has been invoked

        // check worth of item

        await dbClient.query(`select worth from item where item_name = '${item}'`)
        .then(async (res) => {

            const donation_amount = res.rows[0].worth * amount;

            await dbClient.query(`update fammanager set donation_amount = donation_amount + ${donation_amount}, donation_total = donation_total + ${donation_amount} where discord_name = '${discord}'`)
            .then((res) => {

                print(`${discord} paid ${donation_amount} Gold`);
                msg.react('👌');

            }).catch((e) => {

                //console.error(e);
                print('An error has occurred while executing the pay command');
                msg.react('❌');
            });
            
        }).catch((e) => {

            print('An error has occurred while executing the pay command');
            msg.react('❌');
        });
    } 
}

// resets the pool and sets the expiration date to seven days

const reset = (dbClient, msg) => {

    dbClient.query(`update fammanager set donation_amount = 0, donation_total = 0, expiration_date = current_date + 7`)
    .then((res) => {

        print('Database has been resetted');
        msg.react('👌');

    }).catch((e) => {

        print('An error has occurred while executing the reset command');
        msg.react('❌');
    });
}

module.exports = {

    add,
    remove,
    pay,
    reset
}