window.Class = {
    pokemons,
    pokemon_types,
    getNormalPokemons() {
        return pokemons.filter(pokemon => pokemon.form === 'Normal');
    },
    getNormalTypes() {
        return pokemon_types.filter(entry => entry.form === 'Normal');
    },
    getNormalTypesById() {
        return pokemon_types
            .filter(entry => entry.form === 'Normal')
            .reduce((map, entry) => {
                map[entry.pokemon_id] = entry.type;
                return map;
            }, {});
    },
    getTypesForPokemonId(pokemonId) {
        const entry = pokemon_types.find(pokemon => pokemon.pokemon_id === pokemonId && pokemon.form === 'Normal');
        return entry ? entry.type : [];
    }
};
