import pokemon_moves from "./pokemon_moves.js";

import fast_moves from "./fast_moves.js";

import charged_moves from "./charged_moves.js";

class Attack {
    static all_attacks = {};
    
    constructor(nom, idAttaque, type, puissance, duree) {
        this.nom = nom;
        this.idAttaque = idAttaque;
        this.type = type;
        this.puissance = puissance;
        this.duree = duree;

        Attack.all_attacks[idAttaque] = this;
    }

    toString() {
        return this.nom + " : #" + this.idAttaque + ", " + this.type + ", " + this.puissance + ", " + this.duree + "ms";
    }
}

//à partir de la source de données, crée des objets Type que vous stockez dans all_types
function fill_attacks() {
    //on parcourt les listes d'attaques rapides pour créer des Attack et les stocker dans all_attacks
    for (let i = 0; i < fast_moves.length; i++) {
        let move = fast_moves[i];
        new Attack(move.name, move.move_id, move.type, move.power, move.duration);
    }

    //on parcourt les listes d'attaques chargées pour créer des Attack et les stocker dans all_attacks
    for (let i = 0; i < charged_moves.length; i++) {
        let move = charged_moves[i];
        new Attack(move.name, move.move_id, move.type, move.power, move.duration);
    }
}
fill_attacks();

//test la fonction fill_attacks
//console.table(Attack.all_attacks);

//test la methode toString() avec un exemple d'attaque
//console.log(new Attack("Test", 999, "test", 999, 0.1).toString());

//test après ajout d'une attaque personnalisée
//console.table(Attack.all_attacks);

export default Attack;