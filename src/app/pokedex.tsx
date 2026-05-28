import React, {useEffect, useState} from 'react';
import {getPokemon} from '@/integration/pokemonIntegration';
import {Pokemon} from '@/@types/pokemon';
import{View, Text,  FlatList} from 'react-native';
import { List } from '@/components/list';

export default function Pokedex(){
    const [loading, setLoading] = useState(true);
    const [pokemons, setPokemon] = useState<Pokemon[]>([]);

    useEffect(() => {
        async function loadData(){
            try {
                const data = await getPokemon(151);
                setPokemon(data);
            } catch (error) {
                console.log('Erro ao carregar pokemons', error);
            }finally{
                setLoading(false);
            }
        }
        loadData();
    }, []);

    function handleLoadMore() {
        console.log('Carregar mais pokemons');
    }

  return (
    <List
      data={pokemons}
      onLoadMore={handleLoadMore}
      renderItemContent={(pokemon) => (
        <>
          <Text>#{pokemon.index}</Text>
          <img src={pokemon.imagem} alt="Imagem do Pokemon" />
          <Text>{pokemon.nome}</Text>
        </>
      )}
    />
  );

    
}