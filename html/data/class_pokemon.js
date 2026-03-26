import Type from "./class_type.js";
import Attack from "./class_attack.js";

import pokemon_moves from "./pokemon_moves.js";
import pokemons from "./pokemons.js";

import pokemon_types from "./pokemon_types.js";

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
        return this.nom + " : #" + this.idPokemon + ", ["+ this.nomTypes.map(type => type.nom).join(", ") + "] , [STA: " + this.stamina + ", ATK: " + this.base_attaque + ", DEF: " + this.base_defense + "], Rapides = [" + this.nomAttaqueRapides.join(", ") + "], Chargées = [" + this.nomAttaqueChargees.join(", ") + "]";
    }

    getTypes() {
        return this.nomTypes;
    }

    getAttacks() {
        let attaques = this.nomAttaqueRapides.concat(this.nomAttaqueChargees);

        for (let i = 0; i < attaques.length; i++) {
            let nomAttaque = attaques[i];
            for (let attaque in Attack.all_attacks) {
                if (Attack.all_attacks[attaque].nom == nomAttaque) {
                    attaques[i] = Attack.all_attacks[attaque];
                }
            }
        }

        return attaques;
    }

    static getWeakestEnemies(attackName){
        let attaque = Object.values(Attack.all_attacks).find(attaque => attaque.nom == attackName);
        if (!attaque) {
            console.log("Aucune attaque trouvée avec le nom : " + attackName);
            return;
        }

        let typeAttaque = attaque.type;
        let type = Type.all_types[typeAttaque];
        if (!type) {
            console.log("Type inconnu pour l'attaque : " + attackName + " (" + typeAttaque + ")");
            return;
        }

        let maxEfficiency = 0;
        let listePokemonsEfficaces = [];

        for (let idPokemon in Pokemon.all_pokemons) {
            let lePokemon = Pokemon.all_pokemons[idPokemon];
            let efficacite = 1;
            lePokemon.getTypes().forEach(typePokemon => {
                let coeff = type.efficacite[typePokemon.nom];
                if (coeff !== undefined) {
                    efficacite *= coeff;
                }
            });

            if (efficacite > maxEfficiency) {
                maxEfficiency = efficacite;
                listePokemonsEfficaces = [lePokemon];
            } else if (efficacite == maxEfficiency && maxEfficiency > 0) {
                listePokemonsEfficaces.push(lePokemon);
            }
        }

        console.log("Liste des Pokémons les plus faibles contre l'attaque  " + attackName + " sont : " + listePokemonsEfficaces.length + " avec un coefficient d'efficacité de " + maxEfficiency.toFixed(3) + " :");
        listePokemonsEfficaces.forEach(pokemon => {
            console.log(pokemon.toString());
        });
    }

    getBestFastAttacksForEnemy(print, pokemonName) {
        const ennemi = Object.values(Pokemon.all_pokemons).find(p => p.nom === pokemonName);
        if (!ennemi) {
            console.log("Aucun Pokémon trouvé avec le nom : " + pokemonName);
            return null;
        }

        const resultats = [];

        this.nomAttaqueRapides.forEach(nomAttaque => {
            const attaque = Object.values(Attack.all_attacks).find(a => a.nom === nomAttaque);
            if (!attaque) {
                return;
            }

            const efficacite = ennemi.getTypes().reduce((acc, typePokemon) => {
                const coeff = Type.all_types[attaque.type]?.efficacite[typePokemon.nom];
                return coeff !== undefined ? acc * coeff : acc;
            }, 1);

            const degats = attaque.puissance * efficacite * (this.base_attaque / ennemi.base_defense);
            resultats.push({ attaque, degats, efficacite });
        });

        if (resultats.length === 0) {
            if (print) {
                console.log("Aucune attaque rapide disponible pour " + this.nom + " contre " + ennemi.nom);
            }
            return null;
        }

        resultats.sort((a, b) => {
            if (b.degats !== a.degats) return b.degats - a.degats;
            return a.attaque.nom.localeCompare(b.attaque.nom);
        });

        if (print) {
            console.log("Attaques rapides de " + this.nom + " contre " + ennemi.nom + " :");
            resultats.forEach(r => {
                console.log(r.attaque.toString() + " => dégâts = " + r.degats.toFixed(3) + " (efficacité = " + r.efficacite.toFixed(3) + ")");
            });
        }

        return resultats[0];
    }
}   


//à partir de la source de données, crée des objets Pokemon que vous stockez dans all_pokemons.
function fill_pokemons() {
    //on parcourt la liste des pokémons pour créer des Pokemon et les stocker dans all_pokemons
    for (let i = 0; i < pokemons.length; i++) {
        if (pokemons[i].form === "Normal") {
            new Pokemon(pokemons[i].pokemon_name);
        }
    }   
}
fill_pokemons();

//console.table(Pokemon.all_pokemons);


// console.table(new Pokemon("Bulbasaur").toString());

// console.table(new Pokemon("Bulbasaur").getTypes());

//console.table(new Pokemon("Bulbasaur").getAttacks());

export default Pokemon;