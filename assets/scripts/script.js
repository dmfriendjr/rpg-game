var game;

function Character(name, startingHealth, baseAttackPower, counterAttackPower, isPlayer) {
	this.name = name;
	this.health = startingHealth;
	this.baseHealth = startingHealth;
	this.attackPower = baseAttackPower;
	this.baseAttackPower = baseAttackPower;
	this.counterAttackPower = counterAttackPower;
	this.isPlayer = isPlayer;
	this.lastDamageRecieved;
	
	this.dealDamage = function(targetCharacter) {
		targetCharacter.recieveDamage(this, this.attackPower);
		if (this.isPlayer) {
			this.attackPower += this.baseAttackPower;
		}
	};

	this.recieveDamage = function(attackingCharacter, damageAmount) {
		this.health -= damageAmount;
		this.lastDamageRecieved = damageAmount;
		//We need to counter attack if not the player
		if (!this.isPlayer) {
			attackingCharacter.recieveDamage(this, this.counterAttackPower);
		}
	};

	this.isDead = function() {
		return this.health > 0 ? false : true;
	};
}

function RpgGame() {
	this.characters = [];
	this.possibleNames = ['Spartacus','Hermes','Tetraites','Crixus','Flamma','Carpophorus'];
	this.playerCharacter;
	this.playerCharacterPicked = false;
	this.enemyCharacter;
	this.enemyCharacterPicked = false;
	this.activeDamageText = [];

	this.initialize = function () {
		//Create some random characters
		for (var i = 0; i < 4; i++) {
			this.characters.push(new Character(this.possibleNames[Math.floor(Math.random() * this.possibleNames.length)], //Set name
								this.getRandomInt(90,150), //Set starting health
								this.getRandomInt(5,15), // Set base attack power
								this.getRandomInt(5,30) // Set counter attack power
								,false)); // None of the characters are player to start
			//Remove used name from possibilities
			this.possibleNames.splice(this.possibleNames.indexOf(this.name), 1);

			//Create html elements for each generated character
			let characterDiv = $('<div>');
			characterDiv.attr('class', 'character-wrapper');
			characterDiv.html(`
				<h1 class='character-name'>${this.characters[i].name}</h1>
				<img src="images/gladiator${i+1}.png" alt="${this.characters[i].name} Picture">
				<p class='character-stats'>Health: ${this.characters[i].baseHealth}</p>
				`);
			characterDiv.data('character',this.characters[i]);
			$('.character-container').append(characterDiv);
		}

		//Hide currently unused HTML elements
		$('.player-character-container').hide();
		$('.enemy-character-container').hide();
		$('.combat-log-container').hide();

		$('.character-wrapper').on('click', this.activateCharacter.bind(this));
	};

	//This could be cleaned up a
	//a 
	//lot
	this.activateCharacter = function(event) {
		//If player hasn't picked, then set character as player character
		if (!this.playerCharacterPicked)
		{
			this.playerCharacter = $(event.currentTarget).data('character');
			this.playerCharacter.isPlayer = true;
			//Move to player div
			$('.player-character-container').append(event.currentTarget);
			$('.player-character-container').show();
			$(this).remove();
			//Player has been picked
			this.playerCharacterPicked = true;
			//Change prompt text
			$('.prompt-text').html('Choose Your Opponent');
		}
		//Enemy hasn't picked, set character as enemy
		else if (!this.enemyCharacterPicked)
		{
			//Character clicked is currently player character, do nothing
			if ($(event.currentTarget).data('character').isPlayer) {
				return;
			}

			this.enemyCharacter = $(event.currentTarget).data('character');
			//Move to enemy div
			$('.enemy-character-container').append(event.currentTarget);
			$(this).remove();
			//Enemy has been picked
			this.enemyCharacterPicked = true;
			//Insert attack button into HTML
			$('.attack-button-container').html('<input type="button" id="attack-button" value="Attack">');
			$('#attack-button').on('click', this.handleAttack.bind(this));
			//Show combat and enemy HTML elements
			$('.enemy-character-container').show();
			$('.combat-result-log').html('');
			$('.player-combat-log').html('');
			$('.enemy-combat-log').html('');
			$('.combat-log-container').show();
		}
	};

	this.handleAttack = function(event) {
		//Ensure player and enemy are picked
		if (!this.playerCharacterPicked || !this.enemyCharacterPicked || this.playerCharacter.isDead()) {
			return;
		}

		this.playerCharacter.dealDamage(this.enemyCharacter);

		//Update displayed healths
		$('.player-character-container > .character-wrapper > .character-stats').html(`Health: ${this.playerCharacter.health}`);
		let playerHealthColor = ((this.playerCharacter.health/this.playerCharacter.baseHealth) * 255).toFixed(0);
		$('.player-character-container > .character-wrapper > .character-stats').attr('style', `background-color: rgba(${255-playerHealthColor},${0+playerHealthColor},0,1)`);
		let enemyHealthColor = ((this.enemyCharacter.health/this.enemyCharacter.baseHealth) * 255).toFixed(0);
		$('.enemy-character-container > .character-wrapper > .character-stats').html(`Health: ${this.enemyCharacter.health}`);
		$('.enemy-character-container > .character-wrapper > .character-stats').attr('style', `background-color: rgba(${255-enemyHealthColor},${0+enemyHealthColor},0,1)`);
		//Update combat log
		$('.player-combat-log').html(`You recieved ${this.playerCharacter.lastDamageRecieved} damage!`);
		$('.enemy-combat-log').html(`${this.enemyCharacter.name} recieved ${this.enemyCharacter.lastDamageRecieved} damage!`);

		//Check for deaths after this damage round
		if (this.playerCharacter.isDead()) {
			$('.combat-result-log').html(`${this.playerCharacter.name} is dead! You lose.`);
			$('.player-character-container > .character-wrapper').remove();
			$('.player-character-container').hide();
			this.resetPlayer();
		} // Player death takes priority over enemy death
		else if (this.enemyCharacter.isDead()) {
			$('.combat-result-log').html(`${this.enemyCharacter.name} is dead! You win this round...`);
			//Remove attack button and enemy container from HTML
			$('.attack-button-container').html('');
			$('.enemy-character-container').hide();
			this.resetEnemy();

		}
	}

	this.resetPlayer = function() {
		//Insert restart button into html
		$('.reset-button-container').html('<input type="button" id="restart-button" value="Restart">');
		$('#restart-button').on('click', this.restartGame.bind(this));
	}

	this.restartGame = function () {
		//Reset html before instantiating new game
		$('.character-container').html('');
		$('.player-character-container').html('');
		$('.attack-button-container').html('');
		$('.enemy-character-container').html('');
		$('.reset-button-container').html('');
		$('.player-combat-log').html('');
		$('.enemy-combat-log').html('');
		$('.combat-result-log').html('');
		$('.player-character-container').hide();
		$('.enemy-character-container').hide();
		$('.combat-log-container').hide();
		game = new RpgGame();
		game.initialize();
	}

	this.resetEnemy = function() {
		$('.enemy-character-container > .character-wrapper').remove();
		this.enemyCharacterPicked = false;
	}

	this.getRandomInt = function(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
  		return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
	};
}

$(document).ready(function() {
	game = new RpgGame();
	game.initialize();
});
