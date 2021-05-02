const { exceedment } = require('../config/config.json');

// check payments and extend expiration date if possible
// edit output message
// returns: Everything to print a message

const evaluate = async (dbClient) => {

    let evaluation = {

        who: [],
        items: [],
        weekly_costs: 0,
        daily_costs: 0,
        weekly_costs_per_person: 0,
        daily_costs_per_person: 0,
        exceedment: 0
    }

    // who is helping?

    let res = await dbClient.query('select * from fammanager order by donation_amount_weekly desc');

    res.rows.forEach((entry) => {

        evaluation.who.push({ ingame_name: entry.ingame_name, discord_name: entry.discord_name, donation_amount_weekly: entry.donation_amount_weekly , donation_amount: entry.donation_amount, donation_total: entry.donation_total,expiration_date: entry.expiration_date });

    });

    // item costs

    res = await dbClient.query('select * from item');

    res.rows.forEach((entry) => {

        evaluation.items.push({ item_name: entry.item_name, worth: entry.worth, amount: entry.amount });

    });

    // weekly and daily costs

    let weekly_costs = 0;

    evaluation.items.forEach((entry) => {

        weekly_costs += entry.worth * entry.amount;

    });

    evaluation.weekly_costs = weekly_costs;

    evaluation.daily_costs = weekly_costs / 7;

    evaluation.weekly_costs_per_person = evaluation.weekly_costs / evaluation.who.length;

    evaluation.daily_costs_per_person = evaluation.daily_costs / evaluation.who.length;

    // update weekly donation amount for people who donate a relative amount
    // check if weekly amount will be exceeded and calculate remaining donations

    let weekly_donation_amount = weekly_costs;
    let people = 0;

    evaluation.who.forEach((entry) => {

        if (!entry.donation_amount_weekly)
            people++;
        else
            weekly_donation_amount -= entry.donation_amount_weekly;
    });

    if (weekly_donation_amount <= 0)
        weekly_donation_amount = exceedment; // weekly amount exceeded: set the amount to a million
    else
        weekly_donation_amount /= people;

    let remainder = evaluation.weekly_costs;

    evaluation.who.forEach((entry) => {

        if (!entry.donation_amount_weekly) {
            entry.donation_amount_weekly = weekly_donation_amount;
            remainder -= weekly_donation_amount;

        } else
            remainder -= entry.donation_amount_weekly;
    });

    if (remainder <= 0) {// remainder exists
        remainder *= -1;
        evaluation.exceedment = remainder;
    }

    // extend date and fetch date values

    for(let i=0; i<evaluation.who.length; i++) {

        const skips = Math.floor(evaluation.who[i].donation_amount / evaluation.who[i].donation_amount_weekly);

        if (skips) {
            evaluation.who[i].donation_amount -= skips * evaluation.who[i].donation_amount_weekly;
            res = await dbClient.query(`update fammanager set donation_amount = ${evaluation.who[i].donation_amount}, expiration_date = expiration_date + 7 * ${skips} where discord_name = '${evaluation.who[i].discord_name}'`);
            res = await dbClient.query(`select * from fammanager`);
            evaluation.who[i].expiration_date = res.rows.find((element) => { return element.discord_name == evaluation.who[i].discord_name}).expiration_date;
        }
    }
    return evaluation;
}

module.exports = {

    evaluate
}