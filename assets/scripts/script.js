

function Character(name, startingHealth, baseAttackPower, counterAttackPower, isPlayer) {
	this.name = name;
	this.health = startingHealth;
	this.baseHealth = startingHealth;
	this.attackPower = baseAttackPower;
	this.baseAttackPower = baseAttackPower;
	this.counterAttackPower = counterAttackPower;
	this.isPlayer = isPlayer;
	
	this.dealDamage = function(targetCharacter) {
		targetCharacter.recieveDamage(this, this.attackPower);
		if (this.isPlayer) {
			this.attackPower += this.baseAttackPower;
		}
	};

	this.recieveDamage = function(attackingCharacter, damageAmount) {
		this.health -= damageAmount;
		//We need to counter attack if not the player
		if (!this.isPlayer) {
			attackingCharacter.recieveDamage(this, this.counterAttackPower);
		}

		//Console logs
		console.log(`${this.name} recieved ${damageAmount} damage!! Health is ${this.health}`);
	};

	this.isDead = function() {
		return this.health > 0 ? false : true;
	};
}

function rpgGame() {
	this.characters = [];
	this.possibleNames = ['Spartacus','Hermes','Tetraites','Crixus','Flamma','Carpophorus'];
	this.playerCharacter;
	this.playerCharacterPicked = false;
	this.enemyCharacter;
	this.enemyCharacterPicked = false;

	this.initialize = function () {
		//Create some random characters
		for (var i = 0; i < 4; i++) {
			this.characters.push(new Character(this.possibleNames[Math.floor(Math.random() * this.possibleNames.length)], //Set name
								this.getRandomInt(90,150), //Set starting health
								this.getRandomInt(5,15), // Set base attack power
								this.getRandomInt(5,10) // Set counter attack power
								,false)); // None of the characters are player to start
			//Remove used name from possibilities
			this.possibleNames.splice(this.possibleNames.indexOf(this.name), 1);

			//Create html elements for each generated character
			let characterDiv = $('<div>');
			characterDiv.attr('class', 'character-wrapper');
			characterDiv.html(`
				<h1 class='character-name'>${this.characters[i].name}</h1>
				<img src="http://via.placeholder.com/200x200" alt="${this.characters[i].name} Picture">
				<p class='character-stats'>Health: ${this.characters[i].baseHealth}</p>
				`);
			characterDiv.data('character',this.characters[i]);
			$('.character-container').append(characterDiv);
		}

		$('.character-wrapper').on('click', this.activateCharacter.bind(this));
		$('#attack-button').on('click', this.handleAttack.bind(this));
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
			$(this).remove();
			//Player has been picked
			this.playerCharacterPicked = true;
		}
		//Enemy hasn't picked, set character as enemy
		else if (!this.enemyCharacterPicked)
		{
			this.enemyCharacter = $(event.currentTarget).data('character');
			//Move to enemy div
			$('.enemy-character-container').append(event.currentTarget);
			$(this).remove();
			//Enemy has been picked
			this.enemyCharacterPicked = true;
		}
	};

	this.handleAttack = function(event) {
		//Ensure player and enemy are picked
		if (!this.playerCharacterPicked || !this.enemyCharacterPicked) {
			return;
		}

		this.playerCharacter.dealDamage(this.enemyCharacter);

		//Check for deaths after this damage round
		if (this.playerCharacter.isDead()) {
			console.log(`${this.playerCharacter.name} is dead! You lose.`);
		}
		else if (this.enemyCharacter.isDead()) {
			console.log(`${this.enemyCharacter.name} is dead! You win this round...`);
			this.resetEnemy();
		}
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

var game = new rpgGame();
game.initialize();