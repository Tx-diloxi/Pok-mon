class Pokemon {
    static all_pokemons = {};

    constructor(id, nom, stamina, base_attaque, base_defense, type, attaque_rapide, attaque_chargée) {
        this.id = id;
        this.nom = nom;
        this.stamina = stamina;
        this.base_attaque = base_attaque;
        this.base_defense = base_defense;
        this.types = new Type(type);
        this.attaque_rapide = new Attack(attaque_rapide);
        this.attaque_chargée = new Attack(attaque_chargée);
        Pokemon.all_pokemons[id] = this;
    }

    toString() {
        return this.nom + " : #" + this.id + ", [ " + this.type + "], [STA: " + this.stamina + " ATK: " + this.base_attaque + " DEF: " + this.base_defense + "], Rappide = [" + this.attaque_rapide + "], Chargée = [" + this.attaque_chargée + "]";
    }
}

console.table(Pokemon.all_pokemons);