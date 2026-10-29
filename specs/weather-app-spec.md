# Especificação do Produto — Aplicação de Previsão do Tempo

## Overview

Aplicação web responsiva, em pt-BR, para pesquisar uma cidade e consultar seu clima atual e a previsão diária dos próximos cinco dias. O escopo v1 atende consultas de uma cidade por vez, sem conta, localização automática ou persistência de dados.

### Decisões do escopo v1

- Fonte de geocodificação e meteorologia: Open-Meteo, condicionada à aprovação de cobertura, licença e limites de uso antes da publicação.
- Período: hoje e os quatro dias seguintes, segundo o calendário e fuso horário da cidade selecionada. A previsão é diária; não há previsão horária.
- Temperatura: Celsius por padrão; Fahrenheit pode ser selecionado. A unidade escolhida permanece enquanto a página estiver aberta e volta a Celsius ao recarregar a aplicação.
- Localização: busca iniciada por texto e seleção explícita; o dispositivo não solicita nem usa geolocalização.
- Atualização: consultar os dados ao selecionar uma cidade ou quando a pessoa acionar “Tentar novamente”; não há atualização automática nem cache de dados meteorológicos.
- Privacidade: não há conta, armazenamento no servidor, armazenamento local de consultas ou telemetria. O texto da busca é enviado ao Open-Meteo.

### Objetivos

- Encontrar e confirmar a cidade correta antes de apresentar dados meteorológicos.
- Apresentar condições atuais e cinco datas consecutivas com ausência de dados identificada, sem inferir valores.
- Permitir interpretar todas as temperaturas exibidas em Celsius ou Fahrenheit.

## Functional Requirements

- **RF1 — Buscar cidades:** aceitar uma consulta pelo nome da cidade, removendo espaços no início e no fim. Exibir no máximo cinco correspondências na ordem recebida, cada uma com nome da localidade, região administrativa e país quando disponíveis. Se esses campos não distinguirem resultados homônimos, incluir coordenadas na identificação. A pessoa deve selecionar um resultado antes de consultar o clima.
- **RF2 — Consultar clima atual:** para a cidade selecionada, exibir temperatura, sensação térmica, condição meteorológica em pt-BR, umidade relativa e velocidade do vento. Exibir temperatura com unidade, umidade em porcentagem, vento em km/h e horário dos dados no fuso da cidade.
- **RF3 — Consultar previsão diária:** exibir hoje e os quatro dias seguintes no fuso da cidade, com data, condição meteorológica em pt-BR, temperaturas mínima e máxima, probabilidade de precipitação e velocidade máxima do vento. As unidades são °C/°F, %, e km/h, respectivamente.
- **RF4 — Alternar unidade de temperatura:** aplicar a unidade selecionada a todas as temperaturas atuais e previstas. Converter a partir do valor de origem sem acumular arredondamentos e apresentar uma casa decimal, arredondando empates para longe de zero.

## User Stories

- **US1 — Busca para o dia (RF1, RF2):** Como decisor do clima do dia, quero buscar minha cidade e consultar as condições atuais para decidir como me vestir ou me preparar para sair.
- **US2 — Previsão do destino (RF1, RF3):** Como planejador de viagem, quero encontrar meu destino e consultar a previsão de cinco dias para planejar atividades e o que levar.
- **US3 — Condições para treinar (RF1, RF2, RF3):** Como pessoa que se prepara para atividade física ao ar livre, quero encontrar minha cidade e consultar o clima atual e a previsão para decidir quando treinar e como me preparar.
- **US4 — Escolha da localidade (RF1):** Como planejador de viagem, quero distinguir localidades com o mesmo nome para consultar a previsão do destino correto.
- **US5 — Unidade de temperatura no dia a dia (RF4):** Como decisor do clima do dia, quero alternar entre Celsius e Fahrenheit para interpretar as temperaturas com a unidade que prefiro.
- **US6 — Unidade durante a viagem (RF4):** Como planejador de viagem, quero alternar entre Celsius e Fahrenheit para compreender a previsão do destino na unidade que prefiro.

## Acceptance Criteria

### RF1 — Buscar cidades

- **Given** que a consulta, após remover espaços externos, retorna mais de cinco resultados, **When** a pessoa envia a busca, **Then** a aplicação exibe somente os cinco primeiros na ordem recebida e permite selecionar cada resultado.
- **Given** que há resultados de busca, **When** eles são exibidos, **Then** cada item mostra localidade, região administrativa e país quando fornecidos; coordenadas também são exibidas quando esses nomes não bastam para distinguir dois resultados.
- **Given** que o campo está vazio ou contém apenas espaços, **When** a pessoa envia a busca, **Then** nenhuma requisição de geocodificação é feita e a validação informa que o nome da cidade é obrigatório.
- **Given** que a resposta de geocodificação contém zero resultados, **When** a aplicação a recebe, **Then** é exibido “Nenhuma cidade encontrada”, o texto pesquisado permanece editável e nenhum clima é consultado.
- **Given** que a consulta contém acentos, pontuação ou caracteres especiais, **When** a pessoa a envia, **Then** o texto é tratado como entrada literal, não é interpretado como marcação ou código e segue o fluxo normal de resultados ou ausência de resultados.
- **Given** que a consulta de geocodificação falha ou excede dez segundos, **When** a aplicação trata a falha, **Then** exibe uma mensagem de erro distinta de “Nenhuma cidade encontrada” e oferece “Tentar novamente”.
- **Given** que a busca de cidades está em erro, **When** a pessoa aciona “Tentar novamente” e a geocodificação responde com resultados, **Then** o erro desaparece e os resultados são exibidos.

### RF2 — Consultar clima atual

- **Given** que a pessoa selecionou uma cidade e a resposta contém os cinco campos definidos em RF2, **When** a consulta termina, **Then** a aplicação identifica a cidade e exibe temperatura, sensação térmica, condição em pt-BR, umidade em `%`, vento em `km/h` e horário no fuso da cidade.
- **Given** que um ou mais campos meteorológicos não foram fornecidos, **When** a resposta é exibida, **Then** cada campo ausente mostra “Indisponível” e os demais campos válidos continuam visíveis.
- **Given** que a consulta falha ou não responde em dez segundos, **When** o limite é atingido, **Then** a seção atual mostra erro e “Tentar novamente”, sem apresentar dados antigos como atuais.
- **Given** que a seção atual está em erro, **When** a pessoa aciona “Tentar novamente” e a consulta retorna dados válidos, **Then** o erro desaparece e os valores da cidade selecionada são exibidos.
- **Given** que a pessoa aciona “Tentar novamente” e a nova consulta também falha, **When** a falha é recebida, **Then** o estado de erro permanece visível e a ação continua disponível.

### RF3 — Consultar previsão de cinco dias

- **Given** que a resposta contém mais de cinco datas no fuso da cidade, **When** a previsão é exibida, **Then** são mostradas exatamente as datas locais de hoje até hoje mais quatro dias, em ordem crescente e no formato `dd/MM/yyyy`.
- **Given** que há dados para uma data da previsão, **When** a data é exibida, **Then** ela contém condição em pt-BR, mínima e máxima em temperatura selecionada, probabilidade de precipitação em `%` e vento máximo em `km/h`.
- **Given** que falta um dia ou campo da resposta, **When** a previsão é exibida, **Then** as cinco datas continuam identificadas; o dia ausente mostra “Previsão indisponível” e o campo ausente mostra “Indisponível”, sem preencher valores estimados ou antigos.
- **Given** que a consulta falha ou não responde em dez segundos, **When** o limite é atingido, **Then** apenas a seção de previsão mostra erro e “Tentar novamente”; dados atuais carregados com sucesso permanecem visíveis.
- **Given** que a previsão está em erro, **When** a pessoa aciona “Tentar novamente” e a consulta retorna dados válidos, **Then** o erro desaparece e a previsão da cidade selecionada é exibida.

### RF4 — Alternar unidade de temperatura

- **Given** que a aplicação acabou de ser carregada, **When** qualquer temperatura é exibida, **Then** todas as temperaturas atuais e previstas usam °C com uma casa decimal.
- **Given** que os valores de origem são 20 °C e -1 °C, **When** a pessoa seleciona Fahrenheit, **Then** eles são exibidos como 68,0 °F e 30,2 °F em todas as seções.
- **Given** que os valores de origem são 68 °F e 32 °F, **When** a pessoa seleciona Celsius, **Then** eles são exibidos como 20,0 °C e 0,0 °C em todas as seções.
- **Given** que a pessoa altera a unidade e seleciona outra cidade sem recarregar a página, **When** os novos dados são exibidos, **Then** a unidade escolhida continua aplicada a todas as temperaturas.
- **Given** que a aplicação é recarregada, **When** novas temperaturas são exibidas, **Then** a unidade volta a Celsius.

## Non-Functional Requirements

- **RNF1 — Responsividade:** em larguras a partir de 320 CSS px, em orientação retrato ou paisagem, nenhum fluxo ou conteúdo essencial exige rolagem horizontal ou fica cortado.
- **RNF2 — Acessibilidade:** atender WCAG 2.2 nível AA. Busca, seleção, unidade e nova tentativa devem funcionar por teclado; o foco deve ser visível; controles devem ter nome acessível; contraste deve cumprir os limiares AA.
- **RNF3 — Compatibilidade:** suportar versões atual e anterior de Chrome, Edge, Firefox e Safari para desktop, além de Chrome para Android e Safari para iOS nas versões atual e anterior disponíveis no momento de cada release.
- **RNF4 — Desempenho:** no perfil de teste 360 × 800 CSS px, 10 Mbps de download, 1 Mbps de upload e 100 ms de latência, o LCP da versão de produção deve ser ≤ 2,5 s em pelo menos quatro de cinco execuções. Com resposta simulada do serviço em até 500 ms, os resultados devem aparecer em até 1 s após a resposta.
- **RNF5 — Resiliência:** cada consulta deve atingir estado de erro em no máximo 10 s; nova tentativa é manual. Uma seção bem-sucedida permanece disponível quando a outra falha; dados sem confirmação atual não podem ser apresentados como atuais.
- **RNF6 — Segurança e privacidade:** usar HTTPS; restringir conexões externas aos domínios necessários do Open-Meteo; tratar entrada e resposta como dados, nunca como código executável. Informar antes da primeira busca que o texto será enviado ao provedor. Não coletar localização, histórico ou telemetria nem persistir buscas.
- **RNF7 — Segredos e dependências:** não distribuir credenciais privadas no cliente. O pipeline de release deve verificar dependências; vulnerabilidades críticas ou altas bloqueiam publicação, salvo exceção documentada e aprovada.

## Edge Cases

 - **Cidade inexistente ou geocoding vazio:** exibir “Nenhuma cidade encontrada”, manter a consulta editável e não consultar clima; não escolher outra localidade automaticamente.
 - **Entrada vazia:** não chamar o serviço; exibir validação de campo obrigatório.
 - **Acentos e caracteres especiais:** enviar a consulta como texto literal; nunca interpretá-la como HTML/código. Ausência de correspondência segue o estado sem resultados.
 - **Cidade homônima:** apresentar nome, região e país; se ainda houver duplicidade, incluir coordenadas. Exigir seleção explícita antes das consultas meteorológicas.
 - **Falha, desconexão ou timeout:** após dez segundos no máximo, sinalizar erro, manter a busca disponível e oferecer nova tentativa manual. Não tratar falha como zero resultados nem reutilizar dados antigos como atuais.
 - **Resposta parcial:** manter os dados válidos; indicar campos ausentes como “Indisponível” e dias ausentes como “Previsão indisponível”. Nunca usar zero, estimativa ou valor anterior para preencher lacunas.
 - **Falha de apenas uma seção:** preservar clima atual ou previsão que carregou com sucesso e apresentar erro somente na seção indisponível.
## Assumptions

- Os detalhes de campos, fuso, timeout, acessibilidade e desempenho definidos nesta spec são o baseline de produto v1, já que a discovery não os especifica; alterações exigem revisão dos critérios.
- A aplicação atende uma cidade selecionada por vez em navegadores desktop e móveis; exige conexão ativa e não oferece modo offline.
- Open-Meteo é a fonte sem chave privada no cliente. Cobertura, termos, CORS e limites para as regiões de lançamento precisam ser aprovados antes da publicação.
- Os resultados de geocodificação fornecem coordenadas e fuso horário necessários para identificar a cidade e calcular suas datas locais.
- As personas são hipóteses iniciais; validar sua representatividade antes de ampliar ou priorizar novos fluxos.

## Risks

- **Disponibilidade, cobertura ou condições de uso do Open-Meteo:** podem impedir consultas em regiões de lançamento. Mitigação: validar cobertura, termos, CORS e limites antes da publicação.
- **Dados incompletos ou localidade incorreta:** podem induzir decisões com informação parcial ou da cidade errada. Mitigação: exigir seleção geográfica explícita e apresentar dados ausentes sem inferir valores.
- **Rede instável:** pode impedir consultas. Mitigação: timeout de dez segundos, erro recuperável, nova tentativa manual e isolamento entre as seções atual e previsão.

## Out of Scope

- Previsão horária; v1 apresenta somente resumos diários.
- Aplicativos nativos, PWA, autenticação, contas, favoritos, histórico, alertas e compartilhamento.
- Geolocalização, consulta offline, cache meteorológico e comparação simultânea de cidades.
- Idiomas além de pt-BR e unidades de temperatura além de Celsius/Fahrenheit.
- Aconselhamento de segurança ou substituição de alertas meteorológicos oficiais.

## Open Questions

### Gate de publicação

- O Open-Meteo está aprovado para as regiões de lançamento quanto a licença, atribuição exigida, limites, CORS e cobertura? A resposta deve ser registrada como go/no-go antes da publicação.

**Status:** esta spec define um baseline v1 verificável para orientar desenvolvimento. Os defaults de produto devem ser aprovados pelo responsável do produto antes da implementação; a publicação depende também do gate do Open-Meteo e da validação dos NFRs no ambiente de release.