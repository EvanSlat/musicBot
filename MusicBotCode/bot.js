#!/usr/bin/env node

var Discord = require('discord.js')

var auth = require('./auth.json');

// Initialize Discord Bot

const bot = new Discord.Client({

    token: auth.token,

    autorun: true

});
bot.on('ready', function (evt) {
    console.log('The client is ready!')
});


//start of the BOT
//This lets us download the file
let request = require(`request`);
let fs = require(`fs`);

function download(url, name) {
    try{
    request.get(url)
        .on('error', console.error)
        .pipe(fs.createWriteStream("./musicFiles/" + name));
    } catch {
        console.log("problem")
    }
}

var songsToPlay = [];
var currentSong = 0;

function playLoop(VoiceConnection) {
    try {
        VoiceConnection.play(songsToPlay[currentSong]).on("finish", () => {
            currentSong++;
            if (currentSong == songsToPlay.length) {
                currentSong = 0;
            }
            console.log("looping" + currentSong)
            playLoop(VoiceConnection)
        });
    } catch {
        console.log("problem")
    }
}

function playLoopsingle(VoiceConnection, song) {
    try {
        VoiceConnection.play(song).on("finish", () => {
            playLoopsingle(VoiceConnection, song)
        });
    } catch {
        console.log("problem")
    }
}
//start of the bot
bot.on("message", m => {
    // Our bot needs to know if it will execute a command
    let message = m.content;
    // It will listen for messages that will start with `!`
    var cName = "groovy-plz";
    // cName = "general";
    if (m.channel.name != cName) {
        return;
    }
    if (message.substring(0, 1) == '!') {

        var args = message.substring(1).split(' ');

        var cmd = args[0];


        args = args.splice(1);
        switch (cmd) {

            // !ping

            case 'ping':
                m.channel.send("pong")
                break;


                //download the music
            case 'grab':
                try {
                    if (m.attachments.length == 0) {
                        m.channel.send("incorrect syntax")
                    } else if (m.attachments.first().name.substring(m.attachments.first().name.length - 3) === 'mp3') {
                        download(m.attachments.first().attachment, m.attachments.first().name); //Function I will show later
                        m.channel.send("recevemd file")
                    } else {
                        m.channel.send("incorrect syntax")
                    }
                } catch {
                    console.log("problem")
                }
                break;

                //     // Just add any case commands if you want to..
                //     //play the music
            case ('play'):
                try {
                    var fileLoc = "./musicFiles/" + args[0]
                    // Checking if the message author is in a voice channel.
                    if (!m.member.voice.channel) return m.reply("You must be in a voice channel.");
                    // Checking if the bot is in a voice channel.
                    if (m.guild.me.voice.channel) return m.reply("I'm already playing.");

                    // Joining the channel and creating a VoiceConnection.
                    m.member.voice.channel.join().then(VoiceConnection => {
                        // Playing the music, and, on finish, disconnecting the bot.
                        playLoopsingle(VoiceConnection, fileLoc);
                        m.channel.send("Playing...");
                    }).catch(e => console.log(e))
                } catch {
                    console.log("problem")
                }
                break;
            case ('plist'): //lets you play a list of songs
                try {
                    if (!m.member.voice.channel) return m.reply("You must be in a voice channel.");
                    // Checking if the bot is in a voice channel.
                    if (m.guild.me.voice.channel) return m.reply("I'm already playing.");

                    // Joining the channel and creating a VoiceConnection.
                    m.member.voice.channel.join().then(VoiceConnection => {
                        m.channel.send("Playing...");
                        playLoop(VoiceConnection)
                        // Playing the music, and, on finish, disconnecting the bot.

                    }).catch(e => console.log(e))
                } catch {
                    console.log("problem")
                }
                break;
            case ('addlist'): //add to a list of songs to play
                try {


                    songsToPlay[songsToPlay.length] = "./musicFiles/" + args[0];
                    m.channel.send("Added " + "./musicFiles/" + args[0]);
                } catch {
                    console.log("problem")
                }
                break;
            case ('clearlist'): //bot stops playing the list and leaves
                try {
                    m.member.voice.channel.leave()
                    songsToPlay = [];
                    currentSong = 0;
                } catch {
                    console.log("problem")
                }
                break;
            case ('list'):
                try {
                    var listBuild = "the list\n"
                    songsToPlay.forEach((s, i) => {
                        listBuild += s + "\n";
                    })
                    m.channel.send(listBuild)
                } catch {
                    console.log("problem")
                }
                break;
            case ("songs"):
                try {
                    var files = fs.readdirSync('./musicFiles/');
                    var listBuild = ""
                    files.forEach((s, i) => {
                        listBuild += s + "\n"
                    })
                    m.channel.send(listBuild)
                } catch {
                    console.log("problem")
                }
                break;
            case ("stop"):
                try {
                    m.member.voice.channel.leave()
                } catch {
                    console.log("problem")
                }
                break;
            case('remove'):
            try {
                    fs.unlinkSync("./musicFiles/" + args[0]);
                    m.channel.send("File removed:"+ args[0]);
              } catch (err) {
                console.error(err);
              }

              try {
                m.member.voice.channel.leave()
                songsToPlay = [];
                currentSong = 0;
            } catch {
                console.log("problem")
            }
            break;

            case ("help"):
                try {
                    m.channel.send("grab <mp3 file> // add a mp3 file to the playable files\nplay < filename > // play the mp3 file with the corrisponding name (you do need to add mp3)\nstop // stops the current song\nsongs // lists all the stored files\nplist //play a list of songs on loop\naddlist <filename> //add the named file to the list of songs to play\nclearlist //clears the list of songs\nlist //lists all the songs in the list to play\nremove <filename>//removes the file from the bot and then clear the play list")
                } catch {
                    console.log("problem")
                }
                break;
        }

    }
});

bot.login(auth.token);