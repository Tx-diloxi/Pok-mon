import Type from "./Type.js";
import Attack from "./Attack.js";

import pokemon_moves from "./Info Pokémons/pokemon_moves.js";
import pokemons from "./Info Pokémons/pokemons.js";

import pokemon_types from "./Info Pokémons/pokemon_types.js";

class Pokemon {
    static all_pokemons = {};

    constructor(nom) {

        const TEST = pokemons.find(p => p.pokemon_name == nom && p.form == "Normal");
        const TYPE = pokemon_types.find(p => p.pokemon_name == nom && p.form == "Normal");
        const MOVE = pokemon_moves.find(p => p.pokemon_name == nom && p.form == "Normal");
        
        

        this.nom = nom;
        this.form = TEST.form;
        this.idPokemon = TEST.pokemon_id;
        this.base_attaque = TEST.base_attack;
        this.base_defense = TEST.base_defense;
        this.stamina = TEST.base_stamina;
        this.types = TYPE.type.map(type => Type.all_types[type]);
        
        this.attacks = (MOVE ? (MOVE.charged_moves.concat(MOVE.fast_moves)) : []).map(attack => new Attack(attack));
        
        Pokemon.all_pokemons[this.idPokemon] = this;
    }

    toString() {

    }
}

//console.table(Pokemon.all_pokemons);


console.log(new Pokemon("Bulbasaur").toString());