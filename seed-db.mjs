import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);

try {
  console.log('🗑️  Limpando dados antigos...');
  
  // Limpar tabelas na ordem correta (respeitar foreign keys)
  await connection.execute('DELETE FROM tecnico_municipios');
  await connection.execute('DELETE FROM tecnicos');
  await connection.execute('DELETE FROM municipios');
  await connection.execute('DELETE FROM cidades');
  await connection.execute('DELETE FROM estados');
  await connection.execute('DELETE FROM areas');

  console.log('✅ Dados antigos removidos');

  // Inserir áreas de atuação
  console.log('📝 Inserindo áreas de atuação...');
  const areas = [
    'Infraestrutura',
    'Segurança',
    'Desenvolvimento',
    'Redes',
    'Suporte Técnico',
    'Banco de Dados',
    'Cloud Computing',
    'DevOps',
    'Análise de Sistemas',
    'Gestão de TI',
  ];

  for (const area of areas) {
    await connection.execute(
      'INSERT INTO areas (nome_area) VALUES (?)',
      [area]
    );
  }
  console.log(`✅ ${areas.length} áreas inseridas`);

  // Inserir estados brasileiros
  console.log('📝 Inserindo estados brasileiros...');
  const estados = [
    { uf: 'AC', nome: 'Acre' },
    { uf: 'AL', nome: 'Alagoas' },
    { uf: 'AP', nome: 'Amapá' },
    { uf: 'AM', nome: 'Amazonas' },
    { uf: 'BA', nome: 'Bahia' },
    { uf: 'CE', nome: 'Ceará' },
    { uf: 'DF', nome: 'Distrito Federal' },
    { uf: 'ES', nome: 'Espírito Santo' },
    { uf: 'GO', nome: 'Goiás' },
    { uf: 'MA', nome: 'Maranhão' },
    { uf: 'MT', nome: 'Mato Grosso' },
    { uf: 'MS', nome: 'Mato Grosso do Sul' },
    { uf: 'MG', nome: 'Minas Gerais' },
    { uf: 'PA', nome: 'Pará' },
    { uf: 'PB', nome: 'Paraíba' },
    { uf: 'PR', nome: 'Paraná' },
    { uf: 'PE', nome: 'Pernambuco' },
    { uf: 'PI', nome: 'Piauí' },
    { uf: 'RJ', nome: 'Rio de Janeiro' },
    { uf: 'RN', nome: 'Rio Grande do Norte' },
    { uf: 'RS', nome: 'Rio Grande do Sul' },
    { uf: 'RO', nome: 'Rondônia' },
    { uf: 'RR', nome: 'Roraima' },
    { uf: 'SC', nome: 'Santa Catarina' },
    { uf: 'SP', nome: 'São Paulo' },
    { uf: 'SE', nome: 'Sergipe' },
    { uf: 'TO', nome: 'Tocantins' },
  ];

  const estadosMap = {};
  for (const estado of estados) {
    const [result] = await connection.execute(
      'INSERT INTO estados (nome_estado, uf) VALUES (?, ?)',
      [estado.nome, estado.uf]
    );
    estadosMap[estado.uf] = result.insertId;
  }
  console.log(`✅ ${estados.length} estados inseridos`);

  // Dados de cidades e municípios (amostra de principais cidades)
  console.log('📝 Inserindo cidades e municípios...');
  const cidadesData = {
    SP: [
      { cidade: 'São Paulo', municipios: ['São Paulo', 'Guarulhos', 'Campinas', 'Santos', 'Sorocaba'] },
      { cidade: 'Ribeirão Preto', municipios: ['Ribeirão Preto', 'Araraquara', 'São Carlos'] },
    ],
    RJ: [
      { cidade: 'Rio de Janeiro', municipios: ['Rio de Janeiro', 'Niterói', 'Duque de Caxias', 'Nova Iguaçu'] },
      { cidade: 'Campos dos Goytacazes', municipios: ['Campos dos Goytacazes', 'Macaé'] },
    ],
    MG: [
      { cidade: 'Belo Horizonte', municipios: ['Belo Horizonte', 'Contagem', 'Betim', 'Divinópolis'] },
      { cidade: 'Uberlândia', municipios: ['Uberlândia', 'Uberaba', 'Araxá'] },
    ],
    BA: [
      { cidade: 'Salvador', municipios: ['Salvador', 'Camaçari', 'Lauro de Freitas'] },
      { cidade: 'Feira de Santana', municipios: ['Feira de Santana', 'Vitória da Conquista'] },
    ],
    CE: [
      { cidade: 'Fortaleza', municipios: ['Fortaleza', 'Caucaia', 'Maracanaú', 'Juazeiro do Norte'] },
      { cidade: 'Sobral', municipios: ['Sobral', 'Iguatu'] },
    ],
    PE: [
      { cidade: 'Recife', municipios: ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Paulista'] },
      { cidade: 'Caruaru', municipios: ['Caruaru', 'Garanhuns'] },
    ],
    PR: [
      { cidade: 'Curitiba', municipios: ['Curitiba', 'Ponta Grossa', 'Londrina', 'Maringá'] },
      { cidade: 'Cascavel', municipios: ['Cascavel', 'Foz do Iguaçu'] },
    ],
    SC: [
      { cidade: 'Florianópolis', municipios: ['Florianópolis', 'Joinville', 'Blumenau'] },
      { cidade: 'Santa Catarina', municipios: ['Criciúma', 'Lages'] },
    ],
    RS: [
      { cidade: 'Porto Alegre', municipios: ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Santa Maria'] },
      { cidade: 'Novo Hamburgo', municipios: ['Novo Hamburgo', 'Sapucaia do Sul'] },
    ],
    DF: [
      { cidade: 'Brasília', municipios: ['Brasília', 'Taguatinga', 'Ceilândia'] },
    ],
    GO: [
      { cidade: 'Goiânia', municipios: ['Goiânia', 'Aparecida de Goiânia', 'Anápolis'] },
    ],
    MT: [
      { cidade: 'Cuiabá', municipios: ['Cuiabá', 'Várzea Grande', 'Rondonópolis'] },
    ],
    MS: [
      { cidade: 'Campo Grande', municipios: ['Campo Grande', 'Dourados'] },
    ],
    PA: [
      { cidade: 'Belém', municipios: ['Belém', 'Ananindeua', 'Marabá'] },
    ],
    AM: [
      { cidade: 'Manaus', municipios: ['Manaus', 'Itacoatiara'] },
    ],
  };

  let cidadeCount = 0;
  let municipioCount = 0;

  for (const [uf, cidades] of Object.entries(cidadesData)) {
    const estadoId = estadosMap[uf];
    
    for (const cidadeObj of cidades) {
      const [cidadeResult] = await connection.execute(
        'INSERT INTO cidades (estado_id, nome_cidade) VALUES (?, ?)',
        [estadoId, cidadeObj.cidade]
      );
      const cidadeId = cidadeResult.insertId;
      cidadeCount++;

      for (const municipio of cidadeObj.municipios) {
        await connection.execute(
          'INSERT INTO municipios (cidade_id, nome_municipio) VALUES (?, ?)',
          [cidadeId, municipio]
        );
        municipioCount++;
      }
    }
  }

  console.log(`✅ ${cidadeCount} cidades e ${municipioCount} municípios inseridos`);

  console.log('\n✨ Banco de dados populado com sucesso!');
  console.log(`📊 Resumo:`);
  console.log(`   - ${areas.length} áreas de atuação`);
  console.log(`   - ${estados.length} estados`);
  console.log(`   - ${cidadeCount} cidades`);
  console.log(`   - ${municipioCount} municípios`);

} catch (error) {
  console.error('❌ Erro ao popular banco de dados:', error);
  process.exit(1);
} finally {
  await connection.end();
}
