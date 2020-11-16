/**
 * @name FishyBotPlugin
 * @authorId 325893549071663104
 * @version 0.0.1
 * @description im just testing stuff
 * @source https://raw.githubusercontent.com/Fish-o/FishyPlugin/main/FishyBot.plugin.js
 **/


let sendMessage = function(message, embed= undefined) {
    // Get the ID of the channel we want ot send the embed to
    var channelID = window.location.pathname.split('/').pop();

    // Create the message
    let MessageQueue = DiscordInternals.WebpackModules.findByUniqueProperties(['enqueue']);
    let MessageParser = DiscordInternals.WebpackModules.findByUniqueProperties(["createBotMessage"]);

    let msg = MessageParser.createBotMessage(channelID, "");
    console.log('msg: ')
    console.log(msg)
    // Send the message
    MessageQueue.enqueue({
        type: 0,
        message: {
            channelId: channelID,
            content: message,
            tts: false,
            nonce: msg.id
            
        }
    }, r => {
        return;
    });
}

module.exports = (_ => {
	const config = {
		"info": {
			"name": "FishyBotPlugin",
			"author": "Fish",
			"version": "0.0.1",
			"description": "im just testing stuff"
		},
		"changeLog": {
			"fixed": {
				"Settings": "Work again"
			}
		}
    };
    
	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return config.info.description;}
		
		load() {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue:[]});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
							if (!e && b && b.indexOf(`* @name BDFDB`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
							else BdApi.alert("Error", "Could not download BDFDB library plugin, try again some time later.");
						});
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
		}
		start() {this.load();}
        stop() {}
        
	} : (([Plugin, BDFDB]) => {
        console.log(Plugin)

        return class FishyBotPlugin extends Plugin {    
            onStart() {
                this.keybinds = {mute:['s', 'Control']}
                this.settings = {
                    bot: {
                        prefix:'f!'
                    },
                    mute: {
                        command: 'mute',
                        time:'15m'
                    }
                }
                var keysPressed = {};
                var last_mousse
                document.addEventListener('keydown', (event) => {
                    
                    keysPressed[event.key] = true;
                });
                
                document.addEventListener('keyup', (event) => {
                    delete keysPressed[event.key];
                });

				BDFDB.ListenerUtils.add(this, document, "click", BDFDB.dotCNC.message + BDFDB.dotCN.searchresultsgroupcozy, e => {
                    if (!BDFDB.DOMUtils.getParent(BDFDB.dotCN.messagetoolbarbutton, e.target)) this.onClick(e, keysPressed);
                });

                /*
                BDFDB.ListenerUtils.add(this, document, "keydown", e => {
					if(e.keyEnter){
                        if (!BDFDB.DOMUtils.getParent(BDFDB.dotCN.messagetoolbarbutton, e.target)) this.onClick(e, keysPressed);
                    }
				});
                
				BDFDB.ListenerUtils.add(this, document, "dblclick", BDFDB.dotCNC.message + BDFDB.dotCN.searchresultsgroupcozy, e => {
					if (!BDFDB.DOMUtils.getParent(BDFDB.dotCN.messagetoolbarbutton, e.target)) this.onClick(e, 1, "onDblClick");
				});
				BDFDB.ListenerUtils.add(this, document, "keydown", e => {
					if (BDFDB.DOMUtils.getParent(BDFDB.dotCN.textareawrapchat, document.activeElement)) this.onKeyDown(document.activeElement, e.which, "onKeyDown");
				});*/
				
				this.forceUpdateAll();
            }

            forceUpdateAll() {
				BDFDB.PatchUtils.forceAllUpdates(this);
            }
            
            onClick (e, pressedkeys) {
                console.log('click')
                let good = {}
                this.keybinds.mute.forEach(mutekey =>{
                    if(Object.keys(pressedkeys).includes(mutekey)){
                        good['mute'] += 1/this.keybinds.mute.length  
                    }
                })

                Object.keys(this.keybinds).forEach(command => {
                    good[command] = 0
                    this.keybinds[command].forEach(KeybindKey =>{
                        if(Object.keys(pressedkeys).includes(KeybindKey)){
                            good[command] += 1/ this.keybinds[command].length  
                        }
                    })
                })

                if(good.mute >= .99){
                    let {messageDiv, message} = this.getMessageData(e.currentTarget);
                    if (messageDiv && message) {
                        console.log(message)
                        BdApi.showConfirmationModal("Mute member", `Are you sure you want to mute member ${message.author.username}?${message.author.username} will be muted for ${this.settings.mute.time}.`, {
                            confirmText: "Mute",
                            cancelText: "Cancel",
                            onCancel: _ => {},
                            onConfirm: _ => {
                                sendMessage(`${this.settings.bot.prefix}${this.settings.mute.command} <@${message.author.id}> ${this.settings.mute.time}`)
                            }
                        });
                    }
                } /*else if(good.kick >= .99){
                    let {messageDiv, message} = this.getMessageData(e.currentTarget);
                    if (messageDiv && message) {
                        console.log(message)
                        BdApi.showConfirmationModal("Mute member", `Are you sure you want to mute member ${message.author.username}?${message.author.username} will be muted for ${this.settings.mute.time}.`, {
                            confirmText: "Mute",
                            cancelText: "Cancel",
                            onCancel: _ => {},
                            onConfirm: _ => {
                                sendMessage(`${this.settings.bot.prefix}${this.settings.mute.command} <@${message.author.id}> ${this.settings.mute.time}`)
                            }
                        });
                    }
                }*/
            }
            
            getMessageData (target) {
				let messageDiv = BDFDB.DOMUtils.getParent(BDFDB.dotCNC.message + BDFDB.dotCN.searchresultsgroupcozy, target);
				if (messageDiv && messageDiv.querySelector(BDFDB.dotCN.textarea)) return {messageDiv: null, message: null};
				let instance = BDFDB.ReactUtils.getInstance(messageDiv);
				let message = instance && BDFDB.ReactUtils.findValue(instance, "message");
				return {messageDiv, message};
			}
        };
    })(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();
