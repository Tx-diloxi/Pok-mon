import Type from "./Type.js";
import Attack from "./Attack.js";

import pokemon_moves from "./Info Pokémons/pokemon_moves.js";
import pokemons from "./Info Pokémons/pokemons.js";

import pokemon_types from "./Info Pokémons/pokemon_types.js";

class Pokemon {
    static all_pokemons = {};

    constructor(nom) {

        let lesInfosDuPokemon = pokemons.find(p => p.pokemon_name == nom && p.form == "Normal");
        let lesTypesDuPokemon = pokemon_types.find(p => p.pokemon_name == nom && p.form == "Normal");
        let lesAttauquesDuPokemon = pokemon_moves.find(p => p.pokemon_name == nom && p.form == "Normal");
        
        
        this.idPokemon = lesInfosDuPokemon.pokemon_id;
        this.nom = nom;
        this.stamina = lesInfosDuPokemon.base_stamina;
        this.base_attaque = lesInfosDuPokemon.base_attack;
        this.base_defense = lesInfosDuPokemon.base_defense;
        
        this.nomTypes = lesTypesDuPokemon.type.map(type => Type.all_types[type]);

        this.nomAttaqueRapides = lesAttauquesDuPokemon.fast_moves;
        this.nomAttaqueChargees = lesAttauquesDuPokemon.charged_moves;

        Pokemon.all_pokemons[this.idPokemon] = this;
    }

    toString() {
        return this.nom + " : #" + this.idPokemon + ", [Normal] , [STA: " + this.stamina + ", ATK: " + this.base_attaque + ", DEF: " + this.base_defense + "], Rapides = [" + this.nomAttaqueRapides.join(", ") + "], Chargées = [" + this.nomAttaqueChargees.join(", ") + "]";
    }

    getAttacks() {
        let attaques = this.nomAttaqueRapides + this.nomAttaqueChargees;  
        for (let i = 0; i < attaques.length; i++) {
            attaques[i] = Attack.all_attacks[attaques[i]];
        }
        return attaques;
    }
}

//console.table(Pokemon.all_pokemons);


console.log(new Pokemon("Bulbasaur").toString());


console.log(new Pokemon("Bulbasaur").getAttacks());