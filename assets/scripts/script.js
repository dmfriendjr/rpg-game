var game;

class Character {
	constructor(name, startingHealth, baseAttackPower, counterAttackPower) {
		this.name = name;
		this.health = startingHealth;
		this.baseHealth = startingHealth;
		this.attackPower = baseAttackPower;
		this.baseAttackPower = baseAttackPower;
		this.counterAttackPower = counterAttackPower;
		this.isPlayer = false;
		this.lastDamageRecieved;
	}
	
	dealDamage(targetCharacter) {
		targetCharacter.recieveDamage(this, this.attackPower);
		if (this.isPlayer) {
			this.attackPower += this.baseAttackPower;
		}
	}

	recieveDamage(attackingCharacter, damageAmount) {
		this.health -= damageAmount;
		this.lastDamageRecieved = damageAmount;
		//We need to counter attack if not the player
		if (!this.isPlayer) {
			attackingCharacter.recieveDamage(this, this.counterAttackPower);
		}
	}

	get isDead() {
		return this.health > 0 ? false : true;
	}
}


class RpgGame {
	constructor() {
			this.possibleNames = ['Spartacus','Hermes','Tetraites','Crixus','Flamma','Carpophorus'];
			this.playerCharacter;
			this.playerCharacterPicked = false;
			this.enemyCharacter;
			this.enemyCharacterPicked = false;
			this.lastRound = false;
			this.htmlElements = {
				promptText: $('.prompt-text'),
				characterContainer: $('.character-container'),
				playerCombatContainer: $('.player-combat-container'),
				enemyCombatContainer: $('.enemy-combat-container'),
				combatLogContainer: $('.combat-log-container'),
				attackButtonContainer: $('.attack-button-container'),
				playerCombatLog: $('.player-combat-log'),
				enemyCombatLog: $('.enemy-combat-log'),
				combatResultLog: $('.combat-result-log'),
				playerCombatStats: undefined,
				enemyCombatStats: undefined
			}
	}

	initialize() {
		//Create some random characters
		for (var i = 0; i < 4; i++) {
			let newCharacter = new Character(this.possibleNames[Math.floor(Math.random() * this.possibleNames.length)], //Set name
								this.getRandomInt(90,125), //Set starting health
								this.getRandomInt(5,20), // Set base attack power
								this.getRandomInt(5,25)); // Set counter attack power
			//Remove used name from possibilities
			this.possibleNames.splice(this.possibleNames.indexOf(newCharacter.name), 1);

			//Create html elements for each generated character and append to container
			let characterDiv = $('<div>');
			characterDiv.attr('class', 'character-wrapper');
			characterDiv.html(`
				<h1 class='character-name'>${newCharacter.name}</h1>
				<img src="assets/images/gladiator${i+1}.png" alt="${newCharacter.name} Picture">
				<p class='character-stats'>Health: ${newCharacter.baseHealth}</p>
				`);
			//Store character in jquery data structure for the div
			characterDiv.data('character',newCharacter);
			this.htmlElements.characterContainer.append(characterDiv);
		}

		//Ensure character container is being displayed
		this.htmlElements.characterContainer.show();

		//Hide currently unused combat HTML elements
		this.htmlElements.playerCombatContainer.hide();
		this.htmlElements.enemyCombatContainer.hide();
		this.htmlElements.combatLogContainer.hide();
		//Update prompt text
		this.htmlElements.promptText.html('Choose Your Warrior');

		$('.character-wrapper').on('click', this.activateCharacter.bind(this));
	}

	activateCharacter(event) {
		let targetDiv = $(event.currentTarget);
		let targetCharacter = $(event.currentTarget).data('character');
		//If player hasn't picked, then set character as player character
		if (!this.playerCharacterPicked)
		{
			this.playerCharacter = targetCharacter;
			this.playerCharacter.isPlayer = true;
			//Move to player div
			this.htmlElements.playerCombatContainer.append(targetDiv);
			this.htmlElements.playerCombatContainer.show();

			//Player has been picked
			this.playerCharacterPicked = true;
			//Store player stats element
			this.htmlElements.playerCombatStats = this.htmlElements.playerCombatContainer.find('.character-wrapper > .character-stats');
			//Change prompt text
			this.htmlElements.promptText.html('Choose Your Opponent');
			//Do stats update so colors are populated
			this.updatePlayerStats();
		}
		//Enemy hasn't picked, set character as enemy if not player
		else if (!this.enemyCharacterPicked)
		{
			//Character clicked is currently player character, do nothing
			if (targetCharacter.isPlayer) {
				return;
			}

			this.enemyCharacter = targetCharacter;
			//Move to enemy div
			this.htmlElements.enemyCombatContainer.append(targetDiv);

			//Enemy has been picked
			this.enemyCharacterPicked = true;

			//Display enemy with newly appended enemy div
			this.htmlElements.enemyCombatContainer.show();
			//Store enemy combat stats element
			this.htmlElements.enemyCombatStats = this.htmlElements.enemyCombatContainer.find('.character-wrapper > .character-stats');
			//Do stats update so colors are populated
			this.updateEnemyStats();
			//Display and clear combat log
			this.htmlElements.combatResultLog.html('');
			this.htmlElements.playerCombatLog.html('');
			this.htmlElements.enemyCombatLog.html('');
			this.htmlElements.combatLogContainer.show();
			//Display attack button
			this.toggleAttackButton();
			//Check to ensure character container is not empty
			if (this.htmlElements.characterContainer.children('.character-wrapper').length === 0) {
				//No characters left, hide container
				this.htmlElements.characterContainer.hide();
				this.lastRound = true;
			}
		}
	}

	handleAttack(event) {
		//Ensure player and enemy are picked or player isn't dead
		if (!this.playerCharacterPicked || !this.enemyCharacterPicked || this.playerCharacter.isDead) {
			return;
		}

		this.playerCharacter.dealDamage(this.enemyCharacter);

		//Update stats display
		this.updatePlayerStats();
		this.updateEnemyStats();

		//Update combat log
		this.htmlElements.playerCombatLog.html(`You recieved ${this.playerCharacter.lastDamageRecieved} damage!`);
		this.htmlElements.enemyCombatLog.html(`${this.enemyCharacter.name} recieved ${this.enemyCharacter.lastDamageRecieved} damage!`);

		//Check for deaths after this damage round
		if (this.playerCharacter.isDead) {
			this.htmlElements.combatResultLog.html(`${this.playerCharacter.name} is dead! You lose.`);
			this.resetPlayer();
		} // Player death takes priority over enemy death
		else if (this.enemyCharacter.isDead) {
			if (!this.lastRound)
			{
				this.htmlElements.combatResultLog.html(`${this.enemyCharacter.name} is dead! You win this round...`);
				this.resetEnemy();
			}
			else
			{
				this.htmlElements.combatResultLog.html(`${this.enemyCharacter.name} is dead! You are the champion!!!`);
				this.resetEnemy();
				this.enableResetButton();
			}

		}
	}

	updatePlayerStats() {
		//Update displayed player health
		this.htmlElements.playerCombatStats.html(`Health: ${this.playerCharacter.health}`);
		//Change color of stats background to match health percentage
		let playerHealthColor = this.calculateHealthRGB(this.playerCharacter.health, this.playerCharacter.baseHealth);
		this.htmlElements.playerCombatStats.attr('style', `background-color: rgba(${255-playerHealthColor},${0+playerHealthColor},0,1)`);
	}

	updateEnemyStats() {
		//Update displayed enemy health
		this.htmlElements.enemyCombatStats.html(`Health: ${this.enemyCharacter.health}`);
		//Change color of stats background to match health percentage	
		let enemyHealthColor = this.calculateHealthRGB(this.enemyCharacter.health, this.enemyCharacter.baseHealth);	
		this.htmlElements.enemyCombatStats.attr('style', `background-color: rgba(${255-enemyHealthColor},${0+enemyHealthColor},0,1)`);
	}

	calculateHealthRGB(current,max) {
		return ((current/max) * 255).toFixed(0);
	}

	resetPlayer() {
		//Remove attack button
		this.toggleAttackButton();
		//Hide player combat container and remove player from it
		this.htmlElements.playerCombatContainer.children('.character-wrapper').remove();
		this.htmlElements.playerCombatContainer.hide();
		this.enableResetButton();
	}

	resetEnemy() {
		//Remove attack button
		this.toggleAttackButton();
		this.htmlElements.attackButtonContainer.html('');
		//Hide enemy combat container and remove character from it
		this.htmlElements.enemyCombatContainer.hide();
		this.htmlElements.enemyCombatContainer.children('.character-wrapper').remove();
		this.enemyCharacterPicked = false;
	}

	toggleAttackButton() {
		if (this.htmlElements.attackButtonContainer.children('#attack-button').length !== 0) {
			//Disable attack button
			this.htmlElements.attackButtonContainer.html('');
		}
		else
		{
			//Insert attack button into HTML and listen for clicks
			this.htmlElements.attackButtonContainer.html('<input type="button" id="attack-button" value="Attack">');
			$('#attack-button').on('click', this.handleAttack.bind(this));
		}
	}

	enableResetButton() {
		//Insert restart button into html
		this.htmlElements.attackButtonContainer.html('<input type="button" id="reset-button" value="Restart">');
		$('#reset-button').on('click', this.restartGame.bind(this));
	}

	restartGame() {
		//Reset html before instantiating new game
		//Ensure all characters are removed, cant clear these due to other HTML present
		this.htmlElements.characterContainer.children().remove('.character-wrapper');
		this.htmlElements.enemyCombatContainer.children('.character-wrapper').remove();
		this.htmlElements.playerCombatContainer.children('.character-wrapper').remove();
		//Clear other HTML elements
		this.htmlElements.attackButtonContainer.html('');
		this.htmlElements.playerCombatLog.html('');
		this.htmlElements.enemyCombatLog.html('');
		this.htmlElements.combatResultLog.html('');
		$('.reset-button-container').html('');
		//Create new RPG game and initalize
		game = new RpgGame();
		game.initialize();
	}

	getRandomInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
  		return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
	}
}

$(document).ready(function() {
	game = new RpgGame();
	game.initialize();
});
