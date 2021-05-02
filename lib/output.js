const { formattedNumber } = require('./helper');
const dateFormat = require('dateformat');

// after a change in the database, compose new message
// and edit discord post

const composeMessage = (evaluation) => {

    // list helpers

    let message = '**Folgende Mitglieder helfen beim Raidsiegel farmen: **\n\n';

    evaluation.who.forEach((entry) => {

        message += `**${entry.ingame_name}** - ${formattedNumber(entry.donation_amount_weekly)} Gold\n`;
    });

    // list costs

    message += '\n\n**Kosten der einzelnen Items:**\n';

    evaluation.items.forEach((entry) => {

        if (entry.amount)
            message += `${entry.item_name}: ${formattedNumber(entry.worth)} Gold, ${entry.amount} Stück\n`;

    });

    // weekly and daily costs

    message += '\n**Wöchentliche Kosten:** ' + formattedNumber(evaluation.weekly_costs) + ' Gold\n';
    message += '**Übriges Gold:** ' + formattedNumber(evaluation.exceedment) + ' Gold\n';

    //message += '**Tägliche Kosten:** ' + formattedNumber(evaluation.daily_costs) + ' Gold\n\n';
    //message += '**Wöchentliche Kosten pro Person:** ' + formattedNumber(evaluation.weekly_costs_per_person) + ' Gold\n';
    //message += '**Tägliche Kosten pro Person:** ' + formattedNumber(evaluation.daily_costs_per_person) + ' Gold\n\n';

    message += '\n**Beteiligung:**\n\n';

    evaluation.who.forEach((entry) => {

        if (entry.expiration_date >= Date.now()) // not expired
            message += `${entry.ingame_name} hat ${formattedNumber(entry.donation_amount)} / ${formattedNumber(entry.donation_total)} Gold gespendet und ist bis zum ${dateFormat(entry.expiration_date, 'dd.mm.yyyy')} befreit. :white_check_mark:\n`;
        else // expired
            message += `${entry.ingame_name} hat ${formattedNumber(entry.donation_amount)} / ${formattedNumber(entry.donation_total)} Gold gespendet und muss seit dem ${dateFormat(entry.expiration_date, 'dd.mm.yyyy')} aufholen. :x:\n`;
    });

    return message;
}

module.exports = {

    composeMessage
}