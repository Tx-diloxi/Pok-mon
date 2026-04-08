function getGenerationFromId(idPokemon) {
    if (idPokemon <= 151) return "Génération I";
    if (idPokemon <= 251) return "Génération II";
    if (idPokemon <= 386) return "Génération III";
    if (idPokemon <= 493) return "Génération IV";
    if (idPokemon <= 649) return "Génération V";
    if (idPokemon <= 721) return "Génération VI";
    if (idPokemon <= 809) return "Génération VII";
    if (idPokemon <= 898) return "Génération VIII";
    return "Génération IX+";
}

function formatTypes(types) {
    return types.join(" / ");
}

function createPokemonTable() {
    const tbody = document.querySelector("tbody");
    if (!tbody) {
        return;
    }

    const normalTypes = pokemon_types
        .filter(item => item.form === "Normal")
        .reduce((map, item) => {
            map[item.pokemon_id] = item.type;
            return map;
        }, {});

    const normalPokemons = pokemons
        .filter(item => item.form === "Normal")
        .sort((a, b) => a.pokemon_id - b.pokemon_id);

    if (normalPokemons.length === 0) {
        console.error("Aucun Pokémon 'Normal' trouvé dans les données.");
        return;
    }

    normalPokemons.forEach(pokemon => {
        const types = normalTypes[pokemon.pokemon_id] || [];
        const imageId = String(pokemon.pokemon_id).padStart(3, "0");
        const imageSrc = `webp/images/${imageId}.webp`;
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${pokemon.pokemon_id}</td>
            <td>${pokemon.pokemon_name}</td>
            <td>${getGenerationFromId(pokemon.pokemon_id)}</td>
            <td>${formatTypes(types)}</td>
            <td>${pokemon.base_stamina}</td>
            <td>${pokemon.base_attack}</td>
            <td>${pokemon.base_defense}</td>
            <td><img src="${imageSrc}" alt="${pokemon.pokemon_name}" loading="lazy"></td>
        `;

        tbody.appendChild(tr);
    });
}

document.addEventListener("DOMContentLoaded", createPokemonTable);

