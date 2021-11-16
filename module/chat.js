export const hideChatActionButtons = function (message, html, data){
    const card =  html.find(".tftloop.chat-card");
    //console.log(card);
    if(card.length >0){
        let actor = game.actors.get(card.attr("data-actor-id"));

        if ((actor && !actor.owner)){
            const buttons = card.find(".reroll");
            buttons.each((i, btn) =>{
                btn.style.display = "none"
            });
        }
    }
}

export function addChatListeners(html){
    html.on('click', 'button.reroll', onReroll);
    
}

async function onReroll(event) {
    const card = event.currentTarget;
    let actor = game.actors.get(card.dataset.ownerId);
    
    let dicePool = card.dataset.dicepool;
    let rollFormula = dicePool+"d6cs6"

    let rolled = card.dataset.tested;


    //console.log("button click owner" + card.dataset.ownerId+ ": " +actor.data);
    //console.log(card.dataset.rerollformula);

    let r = new Roll(rollFormula, actor.data.data);
    r.evaluate();
    let rollValue = r.total;
    let rollTooltip = await Promise.resolve(r.getTooltip());
    //console.log(rollValue);
    //r.toMessage("this is our roll from our dice pool");
    let sucessText = game.i18n.localize("tftloop.failure");
    if( rollValue>0 ){
        if(rollValue>1){
            sucessText = rollValue+" "+game.i18n.localize("tftloop.successes");
        } else {
            sucessText = rollValue+" "+game.i18n.localize("tftloop.success");
        }
    }

    let reRollDiceFormula = Number(dicePool-r.total);
    //console.log(reRollDiceFormula);
    //TODO pull this out to a template.
    let chatHTML = `
    <span class="flavor-text">
        <div class="chat-header flexrow">
            <img class="portrait" width="48" height="48" src="`+actor.data.img+`"/>
            <h1>`+game.i18n.localize("tftloop.rerolled")+`: `+rolled+`</h1>
        </div>
        
        <div class="dice-roll">
            <div class="dice-result">
                <div class="dice-formula">
                `+r._formula+`
                </div>
                `+rollTooltip+`
                <h4 class="dice-total">`+sucessText+`</h4>
            </div>
        </div>
        <div class="reroll-info" data-owner-id="`+actor._id+`">
                            <button class="reroll" data-owner-id="`+actor._id+`" data-tested="`+rolled+`" data-dicepool="`+reRollDiceFormula+`" type="button">
                            `+game.i18n.localize("tftloop.reroll")+`
                            </button>
                        </div>
        <div class="bug"><img src="systems/tftloop/img/full_transparent.png" width="48" height="48"/></div>
    </span>
    `
    //console.log(rolled);
    if(game.dice3d){
        console.log("dice so nice here");
        let check = game.dice3d.showForRoll(r, game.user, true, null, false);
    }
    //console.log(chatHTML);
    let chatOptions ={
        user: game.user._id,
        speaker: ChatMessage.getSpeaker({actor: actor, token: actor.img}),
        type: CONST.CHAT_MESSAGE_TYPES.OTHER,
        roll: r,
        rollMode: game.settings.get("core", "rollMode"),
        content: chatHTML
    }
    ChatMessage.create(chatOptions);


}