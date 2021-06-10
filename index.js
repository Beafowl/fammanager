// secret info
const { token, databaseClient, input, output, birthdayChannel } = require('./config/config.json');

// discord

const discord = require('discord.js');
const discordClient = new discord.Client();
discordClient.login(token);

// postgresql

const { Client } = require('pg');

// cron for birthday

var cron = require('cron').CronJob;

// helper functions

const { print } = require('./lib/helper');

// database input functions

const { add, remove, pay, reset } = require('./lib/input');

// birthday announcements

const { birthday } = require('./lib/birthday');

// output function

const { composeMessage } = require('./lib/output');

// function to calculate donation amounts and new expiration dates

const { evaluate } = require('./lib/evaluate');

// item function that interacts with the item database

const { item } = require('./lib/item');

// function that return A4 status

const { a4 } = require('./lib/a4');

// backup data

const { backup, restore } = require('./lib/backup');

// function for connecting to the database

let pgClient;

const connectToDB = async () => {

    print('Waiting for database to start up...');
    await new Promise((res) => { setTimeout(res, 5000)});

    let retries = 5;

    while (retries) {

        try {
            pgClient = new Client(databaseClient);
            await pgClient.connect()
            .then(()=> {
                print('Connection to database has been established');    
            });
            break;

        } catch (e) {
            console.error(e);
            print('Error while connecting to the database. Retrying...');
            retries--;
            await new Promise((res) => { setTimeout(res, 5000)});
        }
    }

    if (!retries) {
        print('Could not connect to the database. Exiting...');
        process.exit(1);
    }
}

// update output text channel, use fam-raids channel and chatten channel for reminder

let outputChannel;
let outputMessage;

// discord events

discordClient.on('ready', async () => {

    // set profile information

    discordClient.user.setStatus('available');
    discordClient.user.setPresence({
        game: {
            name: 'Poisonblade',
            type: 'Manager'
        }
    });

    // before the discord bot starts up, connect to database

    await connectToDB();

    // init

    print('Discord bot connected as ' + discordClient.user.tag);
    
    // determine important channels

    let outputChannelId;

    discordClient.channels.cache.each((test) => {

        if (test.name == output)
            outputChannelId = test.id; // output channel

    });

    // initialize message and edit when needed

    discordClient.channels.fetch(outputChannelId)
    .then(async (channel) => {

        // get output channel and delete all messages

        outputChannel = channel;
        await outputChannel.bulkDelete(99);

        // compose message and send it

        const evaluation = await evaluate(pgClient);
        const newMessage = await composeMessage(evaluation);

        outputChannel.send(newMessage)
        .then((msg) => {

            outputMessage = msg;
        })
        .catch((e) => {
            console.error(e);
            print('ERROR: Message could not be sent to the output channel');
        });
    })
    .catch((e) => {

        console.error(e);
    });

    // check for someones birthday at 2pm everyday

    let job = new cron('0 14 * * *', async () => {

        await pgClient.query('select * from birthday')
        .then((res) => {

            const today = new Date();

            for(let i=0; i<res.rowCount; i++) {

                let bday = new Date(res.rows[i].birthday_date);

                if (today.getUTCMonth() == bday.getUTCMonth() && today.getUTCDate() == bday.getUTCDate()) {

                    discordClient.channels.cache.each((test) => {

                        if (test.name == birthdayChannel) { // output birthdays on this channel id

                            discordClient.channels.cache.get(test.id).send(`@${res.rows[i].discord_name} hat heute Geburtstag. Herzlichen Grlückwunsch!`);
                            
                        }
                    });
                }
            }
        })
    }, null, true);
    job.start();
});

discordClient.on('message', async (msg) => {

    if (msg.author == discordClient.user)
        return;

    // commands

    const command = msg.content.split(' ');

    // global commands, can be used in every channel

    if (command[0] == '!a4' || command [0] == '!status') // check a4 status
        await a4(msg);
    
    if (command[0] == '!birthday') // birthday announcements
        await birthday(pgClient, msg, msg.author.tag, command[1]);

    // Finances start

    if (msg.channel.name == input) {
   
        if (command[0] == '!add') { // !add [Name]: Adds a player to the donator list

            await add(pgClient, msg.author.tag, command[1], command[2], command[3], msg);

        } else if (command[0] == '!remove') { // !remove [Name]: Removes a player from donator list

            remove(pgClient, msg.author.tag, command[1], msg);

        } else if (command[0] == '!pay') { // !pay [Amount]: Donates a specific amount of gold. !pay [Amount] [Item]: Donates with a specific amount of an item

            await pay(pgClient, msg.author.tag, command[1], command[2], msg);

        } else if (command[0] == '!reset' || command[0] == '!clear') { // !reset: Resets the donated amounts and sets the expiration date to seven days from now

            reset(pgClient, msg);

        } else if (command[0] == '!item') { // !item [Item Name] [Worth] [Amount]: Inserts or changes an items value and amount per week

            item(pgClient, command[1], command[2], command[3], msg);

        } else if (command[0] == '!backup') {

            backup(msg);

        } else if (command[0] == '!restore') {

            restore(msg);
        }

        const evaluation = await evaluate(pgClient);
        const newMessage = composeMessage(evaluation);
        outputMessage.edit(newMessage);

    }

    // Finances end
});
