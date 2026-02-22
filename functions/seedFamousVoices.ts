import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const famousVoices = [
      {
        name: 'Luffy (One Piece)',
        category: 'anime_character',
        nationality: 'Japanese',
        gender: 'male',
        age_range: 'teen',
        personality_type: 'hero',
        voice_characteristics: 'Energético, apasionado, determinado',
        source: 'One Piece',
        description: 'La voz característica de Monkey D. Luffy, el protagonista de One Piece. Perfecta para personajes aventureros y heroicos.',
        avatar_emoji: '🏴‍☠️',
        tags: ['anime', 'aventura', 'protagonista', 'one piece'],
        legal_status: 'educational_use'
      },
      {
        name: 'Naruto Uzumaki',
        category: 'anime_character',
        nationality: 'Japanese',
        gender: 'male',
        age_range: 'young_adult',
        personality_type: 'hero',
        voice_characteristics: 'Decidido, entusiasta, nunca se rinde',
        source: 'Naruto',
        description: 'La voz emblemática de Naruto Uzumaki. Ideal para personajes inspiradores y determinados.',
        avatar_emoji: '🥷',
        tags: ['anime', 'ninja', 'protagonista', 'naruto'],
        legal_status: 'educational_use'
      },
      {
        name: 'Pikachu',
        category: 'anime_character',
        nationality: 'Japanese',
        gender: 'neutral',
        age_range: 'child',
        personality_type: 'comedic',
        voice_characteristics: 'Agudo, adorable, repetitivo',
        source: 'Pokemon',
        description: 'El icónico sonido de Pikachu. Perfecto para personajes juguetones y adorables.',
        avatar_emoji: '⚡',
        tags: ['pokemon', 'infantil', 'mascota'],
        legal_status: 'educational_use'
      },
      {
        name: 'Darth Vader',
        category: 'movie_character',
        nationality: 'English',
        gender: 'male',
        age_range: 'adult',
        personality_type: 'villain',
        voice_characteristics: 'Profundo, amenazante, oscuro',
        source: 'Star Wars',
        description: 'La voz icónica del villano más famoso del cine. Perfecta para antagonistas poderosos.',
        avatar_emoji: '🖤',
        tags: ['starwars', 'villano', 'clásico'],
        legal_status: 'educational_use'
      },
      {
        name: 'Elsa',
        category: 'movie_character',
        nationality: 'English',
        gender: 'female',
        age_range: 'young_adult',
        personality_type: 'hero',
        voice_characteristics: 'Elegante, poderoso, emocional',
        source: 'Frozen',
        description: 'La voz majestuosa de Elsa. Ideal para personajes mágicos y fuertes.',
        avatar_emoji: '❄️',
        tags: ['disney', 'magia', 'reina'],
        legal_status: 'educational_use'
      },
      {
        name: 'Shrek',
        category: 'movie_character',
        nationality: 'Scottish English',
        gender: 'male',
        age_range: 'adult',
        personality_type: 'comedic',
        voice_characteristics: 'Gruñón, divertido, con acento',
        source: 'Shrek',
        description: 'La voz característica del ogro más famoso. Perfecta para personajes cómicos.',
        avatar_emoji: '👹',
        tags: ['dreamworks', 'comedia', 'ogro'],
        legal_status: 'educational_use'
      },
      {
        name: 'Gollum',
        category: 'movie_character',
        nationality: 'English',
        gender: 'male',
        age_range: 'senior',
        personality_type: 'villain',
        voice_characteristics: 'Susurrador, perturbador, único',
        source: 'El Señor de los Anillos',
        description: 'La voz distintiva de Gollum. Para personajes misteriosos y oscuros.',
        avatar_emoji: '👤',
        tags: ['lotr', 'personaje único', 'misterio'],
        legal_status: 'educational_use'
      },
      {
        name: 'Harley Quinn',
        category: 'movie_character',
        nationality: 'English',
        gender: 'female',
        age_range: 'young_adult',
        personality_type: 'comedic',
        voice_characteristics: 'Juguetón, loco, energético',
        source: 'Batman Universe',
        description: 'La voz caótica de Harley Quinn. Ideal para personajes desenfrenados y divertidos.',
        avatar_emoji: '💣',
        tags: ['dc', 'villana', 'comedia'],
        legal_status: 'educational_use'
      },
      {
        name: 'Morgan Freeman',
        category: 'actor',
        nationality: 'American',
        gender: 'male',
        age_range: 'senior',
        personality_type: 'wise',
        voice_characteristics: 'Profundo, cálido, narrativo',
        source: 'Actor profesional',
        description: 'La voz autorizada y reconfortante de Morgan Freeman. Perfecta para narradores y personajes sabios.',
        avatar_emoji: '🎬',
        tags: ['actor', 'narrador', 'sabio'],
        legal_status: 'educational_use'
      },
      {
        name: 'Meryl Streep',
        category: 'actor',
        nationality: 'American',
        gender: 'female',
        age_range: 'senior',
        personality_type: 'wise',
        voice_characteristics: 'Elegante, versátil, expresivo',
        source: 'Actriz profesional',
        description: 'La voz versátil de Meryl Streep. Excelente para personajes complejos y emocionantes.',
        avatar_emoji: '🎭',
        tags: ['actriz', 'drama', 'clásico'],
        legal_status: 'educational_use'
      }
    ];

    const created = await base44.entities.FamousVoice.bulkCreate(famousVoices);

    return Response.json({
      success: true,
      message: `${created.length} voces famosas creadas`,
      count: created.length
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});